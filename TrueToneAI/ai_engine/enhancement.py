"""
Image Enhancement Suite for TrueTone AI
Provides independent controls for Noise Reduction, Scratch Reduction, Detail Enhancement,
and Optional AI Super-Resolution (Real-ESRGAN).
Preserves natural texture without waxy smoothing or aggressive sharpening.
"""

import os
import cv2
import numpy as np
import torch
from typing import Optional
from .gpu_manager import gpu_manager


class ImageEnhancer:
    def __init__(self, models_dir: Optional[str] = None):
        self.device = gpu_manager.device
        self.models_dir = models_dir or os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        self.realesrgan_model: Optional[object] = None

    def reduce_noise(self, img_bgr: np.ndarray, strength: int = 25) -> np.ndarray:
        """
        Gentle edge-preserving noise reduction.
        Preserves natural grain and fine lines while removing high-frequency digital/film noise.
        """
        if strength <= 0:
            return img_bgr

        # Compute adaptive sigma based on strength (1 to 100)
        sigma_color = float(strength) * 0.7
        sigma_space = float(strength) * 0.15 + 2.0

        # Run bilateral filter on Lab color space to protect colors
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        l_filtered = cv2.bilateralFilter(l, d=5, sigmaColor=sigma_color, sigmaSpace=sigma_space)
        merged = cv2.merge([l_filtered, a, b])
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

    def reduce_scratches(self, img_bgr: np.ndarray, strength: int = 30) -> np.ndarray:
        """
        Detects fine scratches, dust specks, and cracks in old photographs
        and restores them using edge-aware inpainting without blurring surrounding areas.
        """
        if strength <= 0:
            return img_bgr

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Morphological black-hat and white-hat filter to find thin scratches
        kernel_len = max(3, int(strength * 0.12))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, kernel_len))
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
        whitehat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)

        scratch_features = cv2.add(blackhat, whitehat)
        thresh_val = max(20, int(120 - strength * 0.8))
        _, mask = cv2.threshold(scratch_features, thresh_val, 255, cv2.THRESH_BINARY)

        # Inpaint only the identified scratch pixels
        inpaint_radius = 2
        restored = cv2.inpaint(img_bgr, mask, inpaint_radius, cv2.INPAINT_TELEA)
        return restored

    def enhance_details(self, img_bgr: np.ndarray, strength: int = 30) -> np.ndarray:
        """
        Subtle micro-contrast and edge definition enhancement.
        Operates exclusively on luminance to prevent chromatic aberrations or halo artifacts.
        """
        if strength <= 0:
            return img_bgr

        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        factor = (strength / 100.0) * 0.6
        blurred = cv2.GaussianBlur(l, (0, 0), 1.2)
        high_freq = cv2.subtract(l, blurred)
        l_enhanced = cv2.addWeighted(l, 1.0, high_freq, factor, 0)

        merged = cv2.merge([l_enhanced, a, b])
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

    def ai_upscale(self, img_bgr: np.ndarray, scale: int = 2) -> np.ndarray:
        """
        AI-powered super-resolution using Real-ESRGAN on NVIDIA RTX 4080.
        Falls back to high-order Lanczos interpolation if weights are not yet present.
        """
        if scale <= 1:
            return img_bgr

        model_path = os.path.join(self.models_dir, 'RealESRGAN_x4plus.pth')
        if os.path.exists(model_path):
            try:
                from realesrgan import RealESRGANer
                from basicsr.archs.rrdbnet_arch import RRDBNet

                if self.realesrgan_model is None:
                    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
                    upsampler = RealESRGANer(
                        scale=4,
                        model_path=model_path,
                        model=model,
                        tile=400,
                        tile_pad=32,
                        pre_pad=0,
                        half=(self.device.type == 'cuda'),
                        device=self.device
                    )
                    self.realesrgan_model = upsampler

                output, _ = self.realesrgan_model.enhance(img_bgr, outscale=scale)
                return output
            except Exception as e:
                print(f"[ImageEnhancer] Real-ESRGAN fallback: {e}")

        # High-quality Lanczos4 interpolation fallback
        h, w = img_bgr.shape[:2]
        return cv2.resize(img_bgr, (w * scale, h * scale), interpolation=cv2.INTER_LANCZOS4)


image_enhancer = ImageEnhancer()
