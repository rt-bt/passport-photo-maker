"""
Background Asynchronous Image Processor for TrueTone AI
Uses PySide6 QThread to ensure the UI remains smooth and responsive during GPU inference.
"""

import numpy as np
import traceback
from typing import List, Dict, Any, Optional
from PySide6.QtCore import QThread, Signal

from ai_engine.colorizer import colorizer_pipeline
from ai_engine.gpu_manager import gpu_manager
from core.image_loader import ImageLoader
from core.image_exporter import ImageExporter


class SingleColorizeWorker(QThread):
    progress_updated = Signal(int, str)
    gpu_stats_updated = Signal(dict)
    finished = Signal(dict)
    failed = Signal(str)

    def __init__(
        self,
        img_bgr: np.ndarray,
        source_path: str,
        options: Dict[str, Any]
    ):
        super().__init__()
        self.img_bgr = img_bgr
        self.source_path = source_path
        self.options = options
        self._is_cancelled = False

    def cancel(self):
        self._is_cancelled = True

    def run(self):
        try:
            self.progress_updated.emit(5, "Preparing GPU tensor memory...")
            gpu_stats = gpu_manager.get_vram_info()
            self.gpu_stats_updated.emit(gpu_stats)

            def on_progress(pct: int, msg: str):
                if self._is_cancelled:
                    raise InterruptedError("Processing cancelled by user")
                self.progress_updated.emit(pct, msg)
                self.gpu_stats_updated.emit(gpu_manager.get_vram_info())

            res = colorizer_pipeline.process_image(
                self.img_bgr,
                model_choice=self.options.get("model", "ddcolor"),
                quality_tier=self.options.get("quality", "high"),
                color_strength=self.options.get("strength", "natural"),
                noise_reduction=self.options.get("noise_reduction", 0),
                scratch_reduction=self.options.get("scratch_reduction", 0),
                detail_enhancement=self.options.get("detail_enhancement", 0),
                upscale_factor=self.options.get("upscale", 1),
                progress_callback=on_progress
            )

            res["source_path"] = self.source_path
            self.finished.emit(res)
        except Exception as e:
            traceback.print_exc()
            self.failed.emit(str(e))


class BatchColorizeWorker(QThread):
    overall_progress = Signal(int, int, str) # current, total, filename
    item_finished = Signal(str, str) # input_path, output_path
    batch_completed = Signal(int, int) # successful, total
    failed = Signal(str)

    def __init__(
        self,
        file_paths: List[str],
        output_dir: str,
        options: Dict[str, Any]
    ):
        super().__init__()
        self.file_paths = file_paths
        self.output_dir = output_dir
        self.options = options
        self._is_cancelled = False

    def cancel(self):
        self._is_cancelled = True

    def run(self):
        total = len(self.file_paths)
        success_count = 0

        try:
            for idx, path in enumerate(self.file_paths):
                if self._is_cancelled:
                    break

                filename = os.path.basename(path)
                self.overall_progress.emit(idx + 1, total, f"Processing ({idx+1}/{total}): {filename}")

                try:
                    img_bgr, _ = ImageLoader.load_image(path)
                    res = colorizer_pipeline.process_image(
                        img_bgr,
                        model_choice=self.options.get("model", "ddcolor"),
                        quality_tier=self.options.get("quality", "high"),
                        color_strength=self.options.get("strength", "natural"),
                        noise_reduction=self.options.get("noise_reduction", 0),
                        scratch_reduction=self.options.get("scratch_reduction", 0),
                        detail_enhancement=self.options.get("detail_enhancement", 0),
                        upscale_factor=self.options.get("upscale", 1)
                    )

                    out_path = ImageExporter.generate_output_path(
                        path,
                        output_dir=self.output_dir,
                        extension="png"
                    )
                    ImageExporter.save_image(res["image"], out_path, format_type="png")
                    success_count += 1
                    self.item_finished.emit(path, out_path)
                except Exception as item_err:
                    print(f"[Batch] Error on {path}: {item_err}")

            self.batch_completed.emit(success_count, total)
        except Exception as e:
            traceback.print_exc()
            self.failed.emit(str(e))
