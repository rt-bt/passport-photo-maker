"""
Image Exporter for TrueTone AI
Saves colorized photographs in original resolution without compression artifacts.
Guarantees the original photograph is NEVER overwritten.
Default output naming: original_filename_colorized.png
"""

import os
import cv2
import numpy as np
from typing import Optional


class ImageExporter:
    @classmethod
    def generate_output_path(
        cls,
        source_path: str,
        output_dir: Optional[str] = None,
        extension: str = "png",
        suffix: str = "_colorized"
    ) -> str:
        """
        Generates safe, non-destructive destination path.
        Default: original_filename_colorized.png
        """
        src_dir, src_file = os.path.split(source_path)
        base_name, _ = os.path.splitext(src_file)

        target_dir = output_dir or src_dir
        os.makedirs(target_dir, exist_ok=True)

        ext = extension.lstrip('.').lower()
        candidate = os.path.join(target_dir, f"{base_name}{suffix}.{ext}")

        # If file exists, add numeric increment to prevent overwriting
        counter = 1
        final_path = candidate
        while os.path.exists(final_path):
            final_path = os.path.join(target_dir, f"{base_name}{suffix}_{counter}.{ext}")
            counter += 1

        return final_path

    @classmethod
    def save_image(
        cls,
        img_bgr: np.ndarray,
        target_path: str,
        format_type: str = "png",
        jpeg_quality: int = 98
    ) -> str:
        """
        Saves image with high fidelity parameters.
        Supports PNG, TIFF, JPG.
        """
        fmt = format_type.lower()
        if fmt in ("jpg", "jpeg"):
            encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality]
        elif fmt == "png":
            # Compression level 3 (fast + lossless)
            encode_params = [int(cv2.IMWRITE_PNG_COMPRESSION), 3]
        elif fmt in ("tif", "tiff"):
            encode_params = [int(cv2.IMWRITE_TIFF_COMPRESSION), 1] # None/LZW
        else:
            encode_params = []

        # Use imencode + tofile for Windows unicode path safety
        ext = os.path.splitext(target_path)[1]
        success, buffer = cv2.imencode(ext, img_bgr, encode_params)
        if not success:
            raise IOError(f"Failed to encode image for: {target_path}")

        buffer.tofile(target_path)
        return target_path
