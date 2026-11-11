"""
DDColor AI Colorization Engine
State-of-the-art dual-decoder colorization for lifelike human skin, clothing, and natural landscapes.
Guarantees 100% original texture and luminance preservation by fusing the untouched original L* channel.
"""

import os
import cv2
import torch
import numpy as np
from typing import Optional, Tuple
from .gpu_manager import gpu_manager
from .ddcolor_arch import DDColor


class DDColorEngine:
    def __init__(self, model_path: Optional[str] = None):
        self.device = gpu_manager.device
        self.model: Optional[torch.nn.Module] = None
        self.loaded_path: Optional[str] = None
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def load_model(self, model_path: str):
        if self.model is not None and self.loaded_path == model_path:
            return

        print(f"[DDColor Engine] Loading model weights from: {model_path} on {self.device}")
        gpu_manager.clear_cache()

        # Determine if tiny or modelscope
        is_large = "modelscope" in model_path.lower() or "large" in model_path.lower()
        encoder_name = "convnext-l" if is_large else "convnext-t"
        num_queries = 256 if is_large else 100

        model = DDColor(
            encoder_name=encoder_name,
            decoder_name='MultiScaleColorDecoder',
            num_input_channels=3,
            input_size=(256, 256),
            nf=512,
            num_output_channels=2,
            last_norm='Spectral',
            do_normalize=False,
            num_queries=num_queries,
            num_scales=3,
            dec_layers=9,
        )

        ckpt = torch.load(model_path, map_location='cpu', weights_only=False)
        sd = ckpt['params'] if 'params' in ckpt else (ckpt['state_dict'] if 'state_dict' in ckpt else ckpt)
        model.load_state_dict(sd, strict=False)
        model.to(self.device).eval()

        self.model = model
        self.loaded_path = model_path
        print(f"[DDColor Engine] ✅ DDColor ({encoder_name}) initialized successfully on {gpu_manager.device_name}")

    def colorize(
        self,
        img_bgr: np.ndarray,
        color_strength: str = "natural", # "natural", "balanced", "vibrant"
        input_size: int = 512,
        tile_size: int = 0
    ) -> np.ndarray:
        """
        Colorizes a grayscale / black-and-white photograph.
        Preserves 100% of the original luminance channel (lighting, texture, grain, sharpness).
        """
        if self.model is None:
            raise RuntimeError("DDColor model is not loaded. Please load a checkpoint first.")

        orig_h, orig_w = img_bgr.shape[:2]

        # Step 1: Convert to CIE Lab color space
        # L channel is luminance [0, 255] which holds ALL fine detail, texture, and geometry
        img_lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        orig_l = img_lab[:, :, 0] # 100% untouched original luminance

        # Check if tiling is needed for large photographs (>2500px)
        if tile_size > 0 and max(orig_h, orig_w) > tile_size:
            return self._colorize_tiled(img_bgr, orig_l, color_strength, tile_size)

        # Step 2: Prepare neural input
        # Resize to model context resolution (e.g. 512x512)
        resized_bgr = cv2.resize(img_bgr, (input_size, input_size), interpolation=cv2.INTER_AREA)
        resized_lab = cv2.cvtColor(resized_bgr, cv2.COLOR_BGR2LAB)
        resized_l = resized_lab[:, :, 0:1] # [H, W, 1]

        # Replicate L to 3 channels and normalize with ImageNet statistics
        l_3ch = np.repeat(resized_l, 3, axis=2).astype(np.float32) / 255.0
        l_norm = (l_3ch - self.mean) / self.std

        tensor_in = torch.from_numpy(l_norm).permute(2, 0, 1).unsqueeze(0).to(self.device)

        # Step 3: Neural inference on GPU
        with torch.no_grad():
            output_ab = self.model(tensor_in) # [1, 2, input_size, input_size]

        ab_pred = output_ab[0].float().permute(1, 2, 0).cpu().numpy() # [input_size, input_size, 2]

        # Step 4: Scale predicted ab chrominance back to full original resolution
        ab_scaled = cv2.resize(ab_pred, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)

        # Step 5: Adjust color strength & saturation
        # strength multiplier: natural (0.88), balanced (1.0), vibrant (1.18)
        strength_factors = {
            "natural": 0.90,
            "balanced": 1.05,
            "vibrant": 1.25
        }
        factor = strength_factors.get(color_strength.lower(), 1.0)
        ab_scaled = ab_scaled * factor

        # Step 6: Fusion with 100% untouched original L* channel
        # OpenCV expects a and b in range [0, 255] with center at 128
        a_cv = np.clip(ab_scaled[:, :, 0] + 128.0, 0, 255).astype(np.uint8)
        b_cv = np.clip(ab_scaled[:, :, 1] + 128.0, 0, 255).astype(np.uint8)

        # Stack [L_original, a_predicted, b_predicted]
        final_lab = np.stack([orig_l, a_cv, b_cv], axis=-1)
        final_bgr = cv2.cvtColor(final_lab, cv2.COLOR_LAB2BGR)

        return final_bgr

    def _colorize_tiled(
        self,
        img_bgr: np.ndarray,
        orig_l: np.ndarray,
        color_strength: str,
        tile_size: int = 1536,
        overlap: int = 192
    ) -> np.ndarray:
        """
        Processes ultra-high-resolution images (4K / 8K) in overlapping tiles
        with cosine feathering to prevent tile seams.
        """
        h, w = img_bgr.shape[:2]
        stride = tile_size - overlap

        out_ab = np.zeros((h, w, 2), dtype=np.float32)
        weight_map = np.zeros((h, w, 1), dtype=np.float32)

        # Cosine blending window
        y_blend = np.hanning(tile_size) if tile_size > 0 else np.ones(tile_size)
        x_blend = np.hanning(tile_size) if tile_size > 0 else np.ones(tile_size)
        tile_weight = np.outer(y_blend, x_blend)[:, :, np.newaxis].astype(np.float32)
        tile_weight = np.maximum(tile_weight, 1e-4)

        for y in range(0, h, stride):
            for x in range(0, w, stride):
                # Clamp tile boundaries
                x1 = x
                y1 = y
                x2 = min(x + tile_size, w)
                y2 = min(y + tile_size, h)
                actual_w = x2 - x1
                actual_h = y2 - y1

                tile_img = img_bgr[y1:y2, x1:x2]

                # Run inference on tile
                tile_resized = cv2.resize(tile_img, (512, 512), interpolation=cv2.INTER_AREA)
                tile_lab = cv2.cvtColor(tile_resized, cv2.COLOR_BGR2LAB)
                tile_l_3ch = np.repeat(tile_lab[:, :, 0:1], 3, axis=2).astype(np.float32) / 255.0
                tile_l_norm = (tile_l_3ch - self.mean) / self.std

                tensor_in = torch.from_numpy(tile_l_norm).permute(2, 0, 1).unsqueeze(0).to(self.device)

                with torch.no_grad():
                    output_ab = self.model(tensor_in)

                tile_ab = output_ab[0].float().permute(1, 2, 0).cpu().numpy()
                tile_ab_scaled = cv2.resize(tile_ab, (actual_w, actual_h), interpolation=cv2.INTER_CUBIC)

                w_sub = tile_weight[:actual_h, :actual_w]
                out_ab[y1:y2, x1:x2] += tile_ab_scaled * w_sub
                weight_map[y1:y2, x1:x2] += w_sub

        # Normalize by total blended weight
        out_ab = out_ab / np.maximum(weight_map, 1e-5)

        strength_factors = {"natural": 0.90, "balanced": 1.05, "vibrant": 1.25}
        factor = strength_factors.get(color_strength.lower(), 1.0)
        out_ab = out_ab * factor

        a_cv = np.clip(out_ab[:, :, 0] + 128.0, 0, 255).astype(np.uint8)
        b_cv = np.clip(out_ab[:, :, 1] + 128.0, 0, 255).astype(np.uint8)
        final_lab = np.stack([orig_l, a_cv, b_cv], axis=-1)
        return cv2.cvtColor(final_lab, cv2.COLOR_LAB2BGR)
