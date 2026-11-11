"""
GPU Manager for TrueTone AI
Optimized specifically for NVIDIA GeForce RTX 4080 Laptop GPU (12GB GDDR6 VRAM)
Handles CUDA detection, VRAM allocation, memory cleanup, and adaptive tiling.
"""

import os
import torch
import platform
from typing import Dict, Any, Tuple, Optional


class GPUManager:
    _instance: Optional['GPUManager'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GPUManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, '_initialized', False):
            return
        self._initialized = True
        self.device, self.device_name, self.vram_total_mb, self.cuda_available = self._detect_hardware()

    def _detect_hardware(self) -> Tuple[torch.device, str, float, bool]:
        """Detect NVIDIA GPU with CUDA or fallback to CPU."""
        if torch.cuda.is_available():
            device = torch.device('cuda:0')
            device_name = torch.cuda.get_device_name(0)
            total_bytes = torch.cuda.get_device_properties(0).total_memory
            total_mb = round(total_bytes / (1024 * 1024), 1)
            # Enable TF32 for fast RTX 40-series tensor cores
            torch.backends.cuda.matmul.allow_tf32 = True
            torch.backends.cudnn.allow_tf32 = True
            torch.backends.cudnn.benchmark = True
            return device, device_name, total_mb, True
        else:
            device = torch.device('cpu')
            proc = platform.processor() or "Multi-Core CPU"
            device_name = f"CPU ({proc})"
            return device, device_name, 0.0, False

    def get_vram_info(self) -> Dict[str, Any]:
        """Returns current VRAM usage in MB and percentage."""
        if not self.cuda_available:
            return {
                "available": False,
                "device_name": self.device_name,
                "used_mb": 0.0,
                "free_mb": 0.0,
                "total_mb": 0.0,
                "percent": 0.0
            }
        try:
            free_bytes, total_bytes = torch.cuda.mem_get_info(0)
            free_mb = round(free_bytes / (1024 * 1024), 1)
            total_mb = round(total_bytes / (1024 * 1024), 1)
            used_mb = round(total_mb - free_mb, 1)
            percent = round((used_mb / total_mb) * 100.0, 1) if total_mb > 0 else 0.0
            return {
                "available": True,
                "device_name": self.device_name,
                "used_mb": used_mb,
                "free_mb": free_mb,
                "total_mb": total_mb,
                "percent": percent
            }
        except Exception:
            return {
                "available": True,
                "device_name": self.device_name,
                "used_mb": 0.0,
                "free_mb": self.vram_total_mb,
                "total_mb": self.vram_total_mb,
                "percent": 0.0
            }

    def clear_cache(self):
        """Cleans up unused GPU VRAM tensors."""
        if self.cuda_available:
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()

    def get_optimal_tile_size(self, width: int, height: int, quality_tier: str = "high") -> int:
        """
        Determines whether image can be processed directly or needs tiling.
        On 12GB RTX 4080, up to 2560x2560 can easily be processed in a single pass.
        For larger resolutions (4K/8K), computes optimal tile size.
        """
        max_dim = max(width, height)
        vram_info = self.get_vram_info()
        free_mb = vram_info.get("free_mb", 8000)

        if max_dim <= 2048:
            return 0 # 0 means single pass (no tiling needed)

        if free_mb >= 6000:
            return 1536
        elif free_mb >= 3000:
            return 1024
        else:
            return 768


gpu_manager = GPUManager()
