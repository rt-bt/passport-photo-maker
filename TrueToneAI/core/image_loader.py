"""
Image Loader for TrueTone AI
Loads JPG, JPEG, PNG, TIFF, BMP, and WEBP photographs with full color depth and orientation preservation.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageOps
from typing import Tuple, Optional


class ImageLoader:
    SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.webp')

    @classmethod
    def is_supported(cls, file_path: str) -> bool:
        ext = os.path.splitext(file_path)[1].lower()
        return ext in cls.SUPPORTED_EXTENSIONS

    @classmethod
    def load_image(cls, file_path: str) -> Tuple[np.ndarray, dict]:
        """
        Loads an image from disk into a standard 8-bit BGR numpy array.
        Handles EXIF orientation and color formats safely.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image not found at path: {file_path}")

        # Use PIL first to respect EXIF orientation (e.g. mobile photos or rotated scans)
        try:
            with Image.open(file_path) as pil_img:
                pil_img = ImageOps.exif_transpose(pil_img)
                # Convert to RGB
                rgb_img = pil_img.convert("RGB")
                img_np = np.array(rgb_img)
                # Convert RGB to BGR for OpenCV processing
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

                meta = {
                    "path": file_path,
                    "filename": os.path.basename(file_path),
                    "width": img_bgr.shape[1],
                    "height": img_bgr.shape[0],
                    "channels": img_bgr.shape[2],
                    "filesize_bytes": os.path.getsize(file_path),
                    "format": pil_img.format or os.path.splitext(file_path)[1][1:].upper()
                }
                return img_bgr, meta
        except Exception:
            # Fallback to direct OpenCV imread with unicode path support
            nparr = np.fromfile(file_path, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                raise ValueError(f"Could not decode image at path: {file_path}")

            meta = {
                "path": file_path,
                "filename": os.path.basename(file_path),
                "width": img_bgr.shape[1],
                "height": img_bgr.shape[0],
                "channels": img_bgr.shape[2],
                "filesize_bytes": os.path.getsize(file_path),
                "format": os.path.splitext(file_path)[1][1:].upper()
            }
            return img_bgr, meta
