"""
Interactive Image Viewer for TrueTone AI
Features drag-and-drop photograph loading, zoom controls, and Before/After comparison modes.
"""

import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QStackedWidget, QFileDialog, QFrame
)
from PySide6.QtGui import QPixmap, QImage, QDragEnterEvent, QDropEvent
from PySide6.QtCore import Qt, Signal

from .comparison_slider import ComparisonSlider


class EmptyDropZone(QFrame):
    file_dropped = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setStyleSheet("""
            QFrame {
                background-color: #14171e;
                border: 2px dashed #2d3442;
                border-radius: 16px;
            }
            QFrame:hover {
                border-color: #4f46e5;
                background-color: #161a23;
            }
        """)

        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(14)

        icon_label = QLabel("📷")
        icon_label.setStyleSheet("font-size: 52px; background: transparent; border: none;")
        icon_label.setAlignment(Qt.AlignCenter)

        title = QLabel("Drag & Drop Old Photograph Here")
        title.setStyleSheet("font-size: 18px; font-weight: 700; color: #f8fafc; background: transparent; border: none;")
        title.setAlignment(Qt.AlignCenter)

        subtitle = QLabel("Supports high-resolution JPG, JPEG, PNG, and TIFF photographs")
        subtitle.setStyleSheet("font-size: 13px; color: #94a3b8; background: transparent; border: none;")
        subtitle.setAlignment(Qt.AlignCenter)

        self.browse_btn = QPushButton("📁 Browse Images")
        self.browse_btn.setObjectName("primaryBtn")
        self.browse_btn.setFixedWidth(180)
        self.browse_btn.clicked.connect(self._on_browse)

        layout.addWidget(icon_label)
        layout.addWidget(title)
        layout.addWidget(subtitle)
        layout.addWidget(self.browse_btn, 0, Qt.AlignCenter)

    def _on_browse(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Select Black & White Photograph",
            "",
            "Images (*.jpg *.jpeg *.png *.tif *.tiff *.bmp *.webp)"
        )
        if file_path:
            self.file_dropped.emit(file_path)

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()

    def dropEvent(self, event: QDropEvent):
        urls = event.mimeData().urls()
        if urls:
            path = urls[0].toLocalFile()
            ext = os.path.splitext(path)[1].lower()
            if ext in ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.webp'):
                self.file_dropped.emit(path)


class ImageViewer(QWidget):
    file_loaded = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_path = ""
        self.view_mode = "split" # "split", "colorized", "original"

        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setSpacing(6)

        # Toolbar for view mode & zoom
        self.toolbar = QFrame()
        self.toolbar.setStyleSheet("background-color: #161920; border-radius: 8px; padding: 2px;")
        tb_layout = QHBoxLayout(self.toolbar)
        tb_layout.setContentsMargins(10, 4, 10, 4)

        self.mode_split_btn = QPushButton("Split Slider")
        self.mode_split_btn.setCheckable(True)
        self.mode_split_btn.setChecked(True)
        self.mode_split_btn.clicked.connect(lambda: self.set_view_mode("split"))

        self.mode_color_btn = QPushButton("Colorized Only")
        self.mode_color_btn.setCheckable(True)
        self.mode_color_btn.clicked.connect(lambda: self.set_view_mode("colorized"))

        self.mode_orig_btn = QPushButton("Original Only")
        self.mode_orig_btn.setCheckable(True)
        self.mode_orig_btn.clicked.connect(lambda: self.set_view_mode("original"))

        self.fit_btn = QPushButton("Fit to Screen")
        self.fit_btn.clicked.connect(self._reset_slider)

        tb_layout.addWidget(self.mode_split_btn)
        tb_layout.addWidget(self.mode_color_btn)
        tb_layout.addWidget(self.mode_orig_btn)
        tb_layout.addStretch()
        tb_layout.addWidget(self.fit_btn)

        # Stacked display (Empty vs Comparison Slider)
        self.stack = QStackedWidget()
        self.drop_zone = EmptyDropZone()
        self.drop_zone.file_dropped.connect(self._on_file_dropped)

        self.slider = ComparisonSlider()

        self.stack.addWidget(self.drop_zone) # Index 0
        self.stack.addWidget(self.slider)    # Index 1

        self.layout.addWidget(self.toolbar)
        self.layout.addWidget(self.stack)

        self.toolbar.hide() # Hide until image is loaded

    def _on_file_dropped(self, path: str):
        self.file_loaded.emit(path)

    def _reset_slider(self):
        self.slider.set_split_ratio(0.5)

    def set_view_mode(self, mode: str):
        self.view_mode = mode
        self.mode_split_btn.setChecked(mode == "split")
        self.mode_color_btn.setChecked(mode == "colorized")
        self.mode_orig_btn.setChecked(mode == "original")

        if mode == "split":
            self.slider.set_split_ratio(0.5)
        elif mode == "colorized":
            self.slider.set_split_ratio(0.0)
        elif mode == "original":
            self.slider.set_split_ratio(1.0)

    def display_images(self, orig_pixmap: QPixmap, color_pixmap: QPixmap = None):
        self.slider.set_images(orig_pixmap, color_pixmap or QPixmap())
        self.stack.setCurrentIndex(1)
        self.toolbar.show()

    def reset_view(self):
        self.stack.setCurrentIndex(0)
        self.toolbar.hide()
