"""
TrueTone AI — Professional Black & White Photo Colorizer
Desktop Application Entry Point
"""

import sys
import os

# Ensure TrueToneAI root is on Python module search path
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
if APP_ROOT not in sys.path:
    sys.path.insert(0, APP_ROOT)

from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon

from app.main_window import MainWindow
from ai_engine.gpu_manager import gpu_manager


def main():
    # Configure High-DPI Scaling for Windows 11 2K/4K Displays
    QApplication.setHighDpiScaleFactorRoundingPolicy(
        Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
    )

    app = QApplication(sys.argv)
    app.setApplicationName("TrueTone AI")
    app.setOrganizationName("TrueTone")

    print("=" * 65)
    print("🚀 Initializing TrueTone AI — Professional Photo Colorizer")
    print(f"⚡ Compute Acceleration: {gpu_manager.device_name}")
    print(f"💾 Dedicated VRAM: {gpu_manager.vram_total_mb} MB (CUDA: {gpu_manager.cuda_available})")
    print("=" * 65)

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
