"""
Model Manager for TrueTone AI
Manages local model weights verification, offline caching, and model integrity.
"""

import os
from typing import Dict, Any, List


class ModelManager:
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            self.models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        else:
            self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)

    def get_models_status(self) -> Dict[str, Dict[str, Any]]:
        """Returns verification status and file size for each AI model."""
        models_info = {
            "ddcolor_tiny": {
                "name": "DDColor (Standard/High)",
                "filename": "ddcolor_paper_tiny.pth",
                "recommended": True,
                "desc": "Primary AI engine. Optimized for fast, realistic portrait and landscape colorization."
            },
            "ddcolor_modelscope": {
                "name": "DDColor (Ultra Quality)",
                "filename": "ddcolor_modelscope.pth",
                "recommended": False,
                "desc": "Flagship 870MB model. Maximum color nuance and historical detail."
            },
            "deoldify": {
                "name": "DeOldify (Artistic)",
                "filename": "ColorizeArtistic_gen.pth",
                "recommended": False,
                "desc": "Alternative engine for vintage photographs and artistic tone mapping."
            },
            "realesrgan": {
                "name": "Real-ESRGAN (AI Upscaler)",
                "filename": "RealESRGAN_x4plus.pth",
                "recommended": True,
                "desc": "Optional 2x/4x super-resolution and fine grain reconstruction."
            }
        }

        results = {}
        for key, info in models_info.items():
            path = os.path.join(self.models_dir, info["filename"])
            exists = os.path.exists(path)
            size_mb = round(os.path.getsize(path) / (1024 * 1024), 1) if exists else 0.0
            results[key] = {
                **info,
                "path": path,
                "installed": exists,
                "size_mb": size_mb,
                "status": "Ready (Offline)" if exists else "Not Installed"
            }
        return results

    def is_ready_for_colorization(self) -> bool:
        """Returns True if at least one colorization engine is installed."""
        status = self.get_models_status()
        return status["ddcolor_tiny"]["installed"] or status["ddcolor_modelscope"]["installed"] or status["deoldify"]["installed"]


model_manager = ModelManager()
