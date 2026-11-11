"""
Master AI Colorization Pipeline for TrueTone AI
Coordinates DDColor, DeOldify, texture preservation, and independent image enhancements.
"""

import os
import cv2
import numpy as np
import time
from typing import Optional, Callable, Dict, Any

from .gpu_manager import gpu_manager
from .ddcolor_engine import DDColorEngine
from .deoldify_engine import DeOldifyEngine
from .enhancement import image_enhancer


class TrueToneColorizer:
    def __init__(self, models_dir: Optional[str] = None):
        self.models_dir = models_dir or os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        self.ddcolor_engine: Optional[DDColorEngine] = None
        self.deoldify_engine: Optional[DeOldifyEngine] = None
        self.current_model_name = "ddcolor"

    def get_available_models(self) -> Dict[str, bool]:
        """Checks which models are downloaded and available locally."""
        tiny_path = os.path.join(self.models_dir, 'ddcolor_paper_tiny.pth')
        large_path = os.path.join(self.models_dir, 'ddcolor_modelscope.pth')
        deoldify_path = os.path.join(self.models_dir, 'ColorizeArtistic_gen.pth')
        return {
            "ddcolor_tiny": os.path.exists(tiny_path),
            "ddcolor_modelscope": os.path.exists(large_path),
            "deoldify": os.path.exists(deoldify_path)
        }

    def _ensure_model(self, model_choice: str = "ddcolor", quality_tier: str = "high"):
        """Loads the requested AI colorization engine into GPU VRAM."""
        choice = model_choice.lower()
        if "deoldify" in choice:
            path = os.path.join(self.models_dir, 'ColorizeArtistic_gen.pth')
            if self.deoldify_engine is None:
                self.deoldify_engine = DeOldifyEngine(path)
            self.current_model_name = "DeOldify (Artistic)"
        else:
            # DDColor
            if quality_tier == "ultra":
                path = os.path.join(self.models_dir, 'ddcolor_modelscope.pth')
                if not os.path.exists(path):
                    path = os.path.join(self.models_dir, 'ddcolor_paper_tiny.pth')
            else:
                path = os.path.join(self.models_dir, 'ddcolor_paper_tiny.pth')

            if self.ddcolor_engine is None or self.ddcolor_engine.loaded_path != path:
                self.ddcolor_engine = DDColorEngine(path)

            tier_label = "Ultra (Flagship)" if "modelscope" in path else "Standard/High (Tiny)"
            self.current_model_name = f"DDColor {tier_label}"

    def process_image(
        self,
        img_bgr: np.ndarray,
        model_choice: str = "ddcolor",
        quality_tier: str = "high", # "standard", "high", "ultra"
        color_strength: str = "natural", # "natural", "balanced", "vibrant"
        noise_reduction: int = 0,
        scratch_reduction: int = 0,
        detail_enhancement: int = 0,
        upscale_factor: int = 1,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Dict[str, Any]:
        """
        Executes the full 7-step TrueTone AI colorization pipeline.
        """
        t0 = time.time()
        orig_h, orig_w = img_bgr.shape[:2]

        def report(pct: int, msg: str):
            if progress_callback:
                progress_callback(pct, msg)

        # STEP 1: Load and analyze original photograph
        report(10, "Analyzing photograph structure & lighting...")
        self._ensure_model(model_choice, quality_tier)

        # Pre-enhancement: Scratch & dust removal before neural processing
        current_img = img_bgr.copy()
        if scratch_reduction > 0:
            report(20, "Applying archival scratch and dust reduction...")
            current_img = image_enhancer.reduce_scratches(current_img, strength=scratch_reduction)

        if noise_reduction > 0:
            report(30, "Applying edge-preserving film noise reduction...")
            current_img = image_enhancer.reduce_noise(current_img, strength=noise_reduction)

        # STEP 2 & 3: Tile size and inference preparation
        report(45, f"Running AI inference on {gpu_manager.device_name}...")
        tile_size = 0
        if quality_tier == "ultra" or max(orig_h, orig_w) > 2200:
            tile_size = gpu_manager.get_optimal_tile_size(orig_w, orig_h, quality_tier)

        # Context input size based on quality tier
        input_size = 640 if quality_tier == "ultra" else (512 if quality_tier == "high" else 400)

        # STEP 4 & 5: Intelligent AI Colorization + 100% Original Luminance Preservation
        if "deoldify" in model_choice.lower() and self.deoldify_engine is not None:
            colorized = self.deoldify_engine.colorize(current_img, color_strength=color_strength)
        else:
            colorized = self.ddcolor_engine.colorize(
                current_img,
                color_strength=color_strength,
                input_size=input_size,
                tile_size=tile_size
            )

        report(75, "Fusing original texture and natural color balance...")

        # STEP 6: Micro-detail enhancement (optional)
        if detail_enhancement > 0:
            report(85, "Applying micro-contrast & optical clarity pop...")
            colorized = image_enhancer.enhance_details(colorized, strength=detail_enhancement)

        # STEP 7: Optional Super-Resolution (Real-ESRGAN)
        if upscale_factor > 1:
            report(90, f"Executing {upscale_factor}x AI super-resolution on RTX 4080...")
            colorized = image_enhancer.ai_upscale(colorized, scale=upscale_factor)

        report(100, "Colorization complete!")
        dt_ms = int((time.time() - t0) * 1000)

        gpu_manager.clear_cache()
        final_h, final_w = colorized.shape[:2]

        return {
            "image": colorized,
            "processing_time_ms": dt_ms,
            "original_width": orig_w,
            "original_height": orig_h,
            "final_width": final_w,
            "final_height": final_h,
            "model_used": self.current_model_name,
            "gpu_used": gpu_manager.device_name
        }


colorizer_pipeline = TrueToneColorizer()
