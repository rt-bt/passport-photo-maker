"""
Main Application Window for TrueTone AI
Professional desktop interface inspired by Adobe Photoshop and Topaz Photo AI.
Optimized specifically for Windows 11 and NVIDIA GeForce RTX 4080 Laptop GPU.
"""

import os
import cv2
import numpy as np
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QFrame, QStackedWidget, QFileDialog, QSlider,
    QComboBox, QGroupBox, QProgressBar, QMessageBox, QCheckBox
)
from PySide6.QtGui import QPixmap, QImage, QIcon, QFont
from PySide6.QtCore import Qt, QTimer

from ai_engine.gpu_manager import gpu_manager
from core.image_loader import ImageLoader
from core.image_exporter import ImageExporter
from core.image_processor import SingleColorizeWorker
from .image_viewer import ImageViewer
from .batch_processor import BatchProcessorView
from .settings_dialog import SettingsDialog


def cv_mat_to_qpixmap(cv_img: np.ndarray) -> QPixmap:
    """Converts OpenCV BGR image array into high-definition PySide6 QPixmap."""
    h, w, ch = cv_img.shape
    bytes_per_line = ch * w
    # OpenCV uses BGR, Qt expects RGB
    rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
    qimg = QImage(rgb.data, w, h, bytes_per_line, QImage.Format_RGB888)
    return QPixmap.fromImage(qimg)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TrueTone AI — Professional Black & White Photo Colorizer")
        self.resize(1340, 860)
        self.setMinimumSize(1100, 720)

        # Active photograph state
        self.current_image_path = ""
        self.original_bgr: np.ndarray = None
        self.colorized_bgr: np.ndarray = None
        self.worker: SingleColorizeWorker = None

        # Build main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 1. Top Bar
        main_layout.addWidget(self._create_top_bar())

        # 2. Body (Sidebar + Content Workspace)
        body_widget = QWidget()
        body_layout = QHBoxLayout(body_widget)
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(0)

        # Left Sidebar
        body_layout.addWidget(self._create_sidebar())

        # Main Central Workspace Stack
        self.content_stack = QStackedWidget()

        # Page 0: Single Colorize Workspace
        self.single_workspace = self._create_single_workspace()
        self.content_stack.addWidget(self.single_workspace)

        # Page 1: Batch Processor View
        self.batch_view = BatchProcessorView()
        self.content_stack.addWidget(self.batch_view)

        # Page 2: About View
        self.about_view = self._create_about_view()
        self.content_stack.addWidget(self.about_view)

        body_layout.addWidget(self.content_stack, 1)
        main_layout.addWidget(body_widget, 1)

        # 3. Bottom Status & GPU Telemetry Bar
        main_layout.addWidget(self._create_bottom_bar())

        # Apply Global Dark Stylesheet
        self._load_stylesheet()

        # Telemetry Timer for GPU VRAM polling
        self.telemetry_timer = QTimer(self)
        self.telemetry_timer.timeout.connect(self._update_gpu_telemetry)
        self.telemetry_timer.start(2500)
        self._update_gpu_telemetry()

    def _load_stylesheet(self):
        style_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'styles', 'dark_theme.qss')
        if os.path.exists(style_path):
            with open(style_path, 'r', encoding='utf-8') as f:
                self.setStyleSheet(f.read())

    def _create_top_bar(self) -> QWidget:
        top_bar = QFrame()
        top_bar.setObjectName("topbar")
        top_bar.setFixedHeight(50)
        layout = QHBoxLayout(top_bar)
        layout.setContentsMargins(18, 0, 18, 0)

        logo_label = QLabel("🎨 TrueTone AI")
        logo_label.setStyleSheet("font-size: 16px; font-weight: 800; color: #38bdf8; background: transparent;")

        badge = QLabel("STUDIO PRO")
        badge.setStyleSheet("font-size: 10px; font-weight: 700; color: #6366f1; background: #1e1b4b; padding: 2px 8px; border-radius: 4px; border: 1px solid #4338ca;")

        sub_label = QLabel("NVIDIA RTX 4080 Neural Hardware Acceleration")
        sub_label.setStyleSheet("font-size: 12px; color: #64748b; background: transparent; margin-left: 8px;")

        settings_btn = QPushButton("⚙️ Settings")
        settings_btn.clicked.connect(self._open_settings)

        layout.addWidget(logo_label)
        layout.addWidget(badge)
        layout.addWidget(sub_label)
        layout.addStretch()
        layout.addWidget(settings_btn)

        return top_bar

    def _create_sidebar(self) -> QWidget:
        sidebar = QFrame()
        sidebar.setObjectName("sidebar")
        sidebar.setFixedWidth(200)

        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(10, 16, 10, 16)
        layout.setSpacing(6)

        self.btn_home = QPushButton("🏠 Home")
        self.btn_home.setObjectName("navBtn")
        self.btn_home.clicked.connect(lambda: self._switch_tab(0, self.btn_home))

        self.btn_colorize = QPushButton("🎨 Colorize Photo")
        self.btn_colorize.setObjectName("navBtn")
        self.btn_colorize.clicked.connect(lambda: self._switch_tab(0, self.btn_colorize))

        self.btn_batch = QPushButton("📁 Batch Processing")
        self.btn_batch.setObjectName("navBtn")
        self.btn_batch.clicked.connect(lambda: self._switch_tab(1, self.btn_batch))

        self.btn_settings = QPushButton("⚙️ Settings")
        self.btn_settings.setObjectName("navBtn")
        self.btn_settings.clicked.connect(self._open_settings)

        self.btn_about = QPushButton("ℹ️ About")
        self.btn_about.setObjectName("navBtn")
        self.btn_about.clicked.connect(lambda: self._switch_tab(2, self.btn_about))

        layout.addWidget(self.btn_home)
        layout.addWidget(self.btn_colorize)
        layout.addWidget(self.btn_batch)
        layout.addWidget(self.btn_settings)
        layout.addWidget(self.btn_about)
        layout.addStretch()

        self._active_nav_btn = self.btn_colorize
        self.btn_colorize.setProperty("active", "true")

        return sidebar

    def _switch_tab(self, index: int, btn: QPushButton):
        if hasattr(self, '_active_nav_btn') and self._active_nav_btn:
            self._active_nav_btn.setProperty("active", "false")
            self._active_nav_btn.style().unpolish(self._active_nav_btn)
            self._active_nav_btn.style().polish(self._active_nav_btn)

        self._active_nav_btn = btn
        btn.setProperty("active", "true")
        btn.style().unpolish(btn)
        btn.style().polish(btn)

        self.content_stack.setCurrentIndex(index)

    def _create_single_workspace(self) -> QWidget:
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(14, 14, 14, 14)
        layout.setSpacing(14)

        # Left / Center: Large Interactive Image Viewer with Drag-and-Drop
        self.viewer = ImageViewer()
        self.viewer.file_loaded.connect(self._on_load_image)
        layout.addWidget(self.viewer, 1)

        # Right: AI Parameter & Adjustment Panel
        controls_frame = QFrame()
        controls_frame.setObjectName("controlPanel")
        controls_frame.setFixedWidth(330)

        c_layout = QVBoxLayout(controls_frame)
        c_layout.setContentsMargins(16, 16, 16, 16)
        c_layout.setSpacing(14)

        panel_title = QLabel("Colorization Studio")
        panel_title.setStyleSheet("font-size: 15px; font-weight: 700; color: #f8fafc;")
        c_layout.addWidget(panel_title)

        # 1. AI Model Selection
        model_group = QGroupBox("AI Colorization Engine")
        mg_layout = QVBoxLayout(model_group)
        self.combo_model = QComboBox()
        self.combo_model.addItem("DDColor (Recommended)", "ddcolor")
        self.combo_model.addItem("DeOldify (Artistic)", "deoldify")
        mg_layout.addWidget(self.combo_model)
        c_layout.addWidget(model_group)

        # 2. Quality Tier
        quality_group = QGroupBox("Processing Quality")
        qg_layout = QVBoxLayout(quality_group)
        self.combo_quality = QComboBox()
        self.combo_quality.addItem("High (Optimal RTX 4080 Balance)", "high")
        self.combo_quality.addItem("Ultra (Maximum Nuance & 640px)", "ultra")
        self.combo_quality.addItem("Standard (Lightning Fast)", "standard")
        qg_layout.addWidget(self.combo_quality)
        c_layout.addWidget(quality_group)

        # 3. Colorization Strength
        strength_group = QGroupBox("Color Palette Strength")
        sg_layout = QVBoxLayout(strength_group)
        self.combo_strength = QComboBox()
        self.combo_strength.addItem("Natural (Realistic & Balanced)", "natural")
        self.combo_strength.addItem("Balanced (Subtle Warm Pop)", "balanced")
        self.combo_strength.addItem("Vibrant (Rich Saturation)", "vibrant")
        sg_layout.addWidget(self.combo_strength)
        c_layout.addWidget(strength_group)

        # 4. Independent Image Enhancements
        enh_group = QGroupBox("Archival Restoration & Enhancements")
        eg_layout = QVBoxLayout(enh_group)
        eg_layout.setSpacing(8)

        # Noise Reduction
        self.chk_noise = QCheckBox("Noise Reduction")
        self.slider_noise = QSlider(Qt.Horizontal)
        self.slider_noise.setRange(0, 100)
        self.slider_noise.setValue(25)
        self.slider_noise.setEnabled(False)
        self.chk_noise.toggled.connect(self.slider_noise.setEnabled)
        eg_layout.addWidget(self.chk_noise)
        eg_layout.addWidget(self.slider_noise)

        # Scratch Reduction
        self.chk_scratch = QCheckBox("Scratch & Dust Removal")
        self.slider_scratch = QSlider(Qt.Horizontal)
        self.slider_scratch.setRange(0, 100)
        self.slider_scratch.setValue(35)
        self.slider_scratch.setEnabled(False)
        self.chk_scratch.toggled.connect(self.slider_scratch.setEnabled)
        eg_layout.addWidget(self.chk_scratch)
        eg_layout.addWidget(self.slider_scratch)

        # Detail Enhancement
        self.chk_detail = QCheckBox("Detail & Texture Definition")
        self.slider_detail = QSlider(Qt.Horizontal)
        self.slider_detail.setRange(0, 100)
        self.slider_detail.setValue(30)
        self.slider_detail.setEnabled(False)
        self.chk_detail.toggled.connect(self.slider_detail.setEnabled)
        eg_layout.addWidget(self.chk_detail)
        eg_layout.addWidget(self.slider_detail)

        # Optional Super-Resolution
        self.chk_upscale = QCheckBox("2x Real-ESRGAN Upscale")
        eg_layout.addWidget(self.chk_upscale)

        c_layout.addWidget(enh_group)

        c_layout.addStretch()

        # Action Buttons
        self.btn_colorize_run = QPushButton("🎨 Colorize Photograph")
        self.btn_colorize_run.setObjectName("primaryBtn")
        self.btn_colorize_run.setEnabled(False)
        self.btn_colorize_run.clicked.connect(self._run_colorization)

        self.btn_save = QPushButton("💾 Save Colorized Image")
        self.btn_save.setEnabled(False)
        self.btn_save.clicked.connect(self._save_colorized_image)

        self.btn_open_another = QPushButton("📂 Open Different Photo")
        self.btn_open_another.clicked.connect(self._browse_new_image)

        c_layout.addWidget(self.btn_colorize_run)
        c_layout.addWidget(self.btn_save)
        c_layout.addWidget(self.btn_open_another)

        layout.addWidget(controls_frame)
        return widget

    def _create_about_view(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(14)

        title = QLabel("TrueTone AI")
        title.setStyleSheet("font-size: 28px; font-weight: 800; color: #38bdf8;")

        version = QLabel("Version 1.0.0 (Windows Desktop Release)")
        version.setStyleSheet("font-size: 13px; color: #94a3b8;")

        desc = QLabel(
            "TrueTone AI is a locally running AI photo colorization studio engineered\n"
            "for Alienware m16 R1 and NVIDIA GeForce RTX 4080 Laptop GPU (12GB VRAM).\n\n"
            "Features:\n"
            "• DDColor Deep Dual-Decoder Neural Colorization (ICCV)\n"
            "• 100% Original Luminance & Micro-Texture Preservation\n"
            "• Natural Human Skin Tone & Landscape Inference\n"
            "• Offline & 100% Private Local Inference (Zero Cloud Uploads)"
        )
        desc.setStyleSheet("font-size: 14px; line-height: 1.6; color: #cbd5e1; text-align: center;")
        desc.setAlignment(Qt.AlignCenter)

        layout.addWidget(title)
        layout.addWidget(version)
        layout.addWidget(desc)
        return widget

    def _create_bottom_bar(self) -> QWidget:
        bottom_bar = QFrame()
        bottom_bar.setObjectName("bottombar")
        bottom_bar.setFixedHeight(36)
        layout = QHBoxLayout(bottom_bar)
        layout.setContentsMargins(16, 0, 16, 0)

        # Status Message
        self.lbl_status = QLabel("Ready • Drag and drop any black & white photograph to begin")
        self.lbl_status.setStyleSheet("color: #94a3b8; font-size: 12px;")

        # Progress Bar
        self.bottom_progress = QProgressBar()
        self.bottom_progress.setFixedWidth(200)
        self.bottom_progress.setValue(0)
        self.bottom_progress.hide()

        # Telemetry Labels
        self.lbl_model_info = QLabel("Engine: DDColor")
        self.lbl_model_info.setStyleSheet("color: #cbd5e1; font-size: 11.5px; margin-right: 12px;")

        self.lbl_gpu_info = QLabel(f"GPU: {gpu_manager.device_name}")
        self.lbl_gpu_info.setStyleSheet("color: #38bdf8; font-size: 11.5px; font-weight: 600;")

        layout.addWidget(self.lbl_status)
        layout.addWidget(self.bottom_progress)
        layout.addStretch()
        layout.addWidget(self.lbl_model_info)
        layout.addWidget(self.lbl_gpu_info)

        return bottom_bar

    def _update_gpu_telemetry(self):
        vram = gpu_manager.get_vram_info()
        if vram["available"]:
            self.lbl_gpu_info.setText(
                f"GPU: RTX 4080 | VRAM: {vram['used_mb']} MB / {vram['total_mb']} MB ({vram['percent']}%)"
            )
        else:
            self.lbl_gpu_info.setText(f"Device: {gpu_manager.device_name}")

    def _browse_new_image(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Open Photograph",
            "",
            "Images (*.jpg *.jpeg *.png *.tif *.tiff *.bmp *.webp)"
        )
        if file_path:
            self._on_load_image(file_path)

    def _on_load_image(self, file_path: str):
        try:
            self.lbl_status.setText(f"Loading {os.path.basename(file_path)}...")
            img_bgr, meta = ImageLoader.load_image(file_path)
            self.original_bgr = img_bgr
            self.colorized_bgr = None
            self.current_image_path = file_path

            pixmap = cv_mat_to_qpixmap(img_bgr)
            self.viewer.display_images(pixmap, None)

            self.btn_colorize_run.setEnabled(True)
            self.btn_save.setEnabled(False)
            self.lbl_status.setText(
                f"Loaded: {meta['filename']} ({meta['width']}x{meta['height']} px) • Ready to Colorize"
            )
        except Exception as e:
            QMessageBox.critical(self, "Load Error", f"Failed to load photograph: {e}")

    def _run_colorization(self):
        if self.original_bgr is None:
            return

        self.btn_colorize_run.setEnabled(False)
        self.btn_save.setEnabled(False)
        self.bottom_progress.show()
        self.bottom_progress.setValue(5)
        self.lbl_status.setText("Initializing AI colorization on NVIDIA RTX 4080...")

        options = {
            "model": self.combo_model.currentData(),
            "quality": self.combo_quality.currentData(),
            "strength": self.combo_strength.currentData(),
            "noise_reduction": self.slider_noise.value() if self.chk_noise.isChecked() else 0,
            "scratch_reduction": self.slider_scratch.value() if self.chk_scratch.isChecked() else 0,
            "detail_enhancement": self.slider_detail.value() if self.chk_detail.isChecked() else 0,
            "upscale": 2 if self.chk_upscale.isChecked() else 1
        }

        self.worker = SingleColorizeWorker(self.original_bgr, self.current_image_path, options)
        self.worker.progress_updated.connect(self._on_worker_progress)
        self.worker.finished.connect(self._on_colorization_finished)
        self.worker.failed.connect(self._on_colorization_failed)
        self.worker.start()

    def _on_worker_progress(self, pct: int, msg: str):
        self.bottom_progress.setValue(pct)
        self.lbl_status.setText(msg)

    def _on_colorization_finished(self, res: dict):
        self.bottom_progress.hide()
        self.btn_colorize_run.setEnabled(True)
        self.btn_save.setEnabled(True)

        self.colorized_bgr = res["image"]
        orig_pixmap = cv_mat_to_qpixmap(self.original_bgr)
        color_pixmap = cv_mat_to_qpixmap(self.colorized_bgr)

        self.viewer.display_images(orig_pixmap, color_pixmap)
        self.lbl_model_info.setText(f"Engine: {res['model_used']}")
        self.lbl_status.setText(
            f"✅ Finished in {res['processing_time_ms']} ms ({res['final_width']}x{res['final_height']} px) • Drag slider to compare"
        )

    def _on_colorization_failed(self, error_msg: str):
        self.bottom_progress.hide()
        self.btn_colorize_run.setEnabled(True)
        self.lbl_status.setText(f"❌ Error during colorization")
        QMessageBox.critical(self, "Inference Error", f"Colorization pipeline error:\n{error_msg}")

    def _save_colorized_image(self):
        if self.colorized_bgr is None:
            return

        suggested_path = ImageExporter.generate_output_path(
            self.current_image_path,
            extension="png",
            suffix="_colorized"
        )

        save_path, _ = QFileDialog.getSaveFileName(
            self,
            "Save Colorized Photograph",
            suggested_path,
            "PNG Image (*.png);;JPEG Image (*.jpg);;TIFF Image (*.tif)"
        )

        if save_path:
            try:
                ext = os.path.splitext(save_path)[1][1:].lower() or "png"
                ImageExporter.save_image(self.colorized_bgr, save_path, format_type=ext)
                self.lbl_status.setText(f"✅ Saved to: {os.path.basename(save_path)}")
                QMessageBox.information(
                    self,
                    "Saved Successfully",
                    f"Colorized photograph saved in original resolution:\n{save_path}"
                )
            except Exception as e:
                QMessageBox.critical(self, "Save Error", f"Failed to save image:\n{e}")

    def _open_settings(self):
        dialog = SettingsDialog(self)
        dialog.exec()
