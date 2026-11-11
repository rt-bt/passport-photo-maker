"""
Batch Processing View for TrueTone AI
Processes multiple black-and-white photographs sequentially using GPU acceleration.
"""

import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QTableWidget, QTableWidgetItem, QHeaderView, QFileDialog,
    QProgressBar, QGroupBox, QComboBox, QMessageBox
)
from PySide6.QtCore import Qt

from core.image_processor import BatchColorizeWorker
from core.image_loader import ImageLoader


class BatchProcessorView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.file_list = []
        self.output_dir = os.path.join(os.path.expanduser("~"), "Pictures", "TrueTone_Output")
        self.worker = None

        layout = QVBoxLayout(self)
        layout.setSpacing(14)
        layout.setContentsMargins(16, 16, 16, 16)

        # Top Bar: Actions
        top_layout = QHBoxLayout()
        self.add_files_btn = QPushButton("➕ Add Photographs")
        self.add_files_btn.clicked.connect(self._add_files)

        self.add_dir_btn = QPushButton("📁 Add Folder")
        self.add_dir_btn.clicked.connect(self._add_folder)

        self.clear_btn = QPushButton("🗑️ Clear List")
        self.clear_btn.clicked.connect(self._clear_list)

        top_layout.addWidget(self.add_files_btn)
        top_layout.addWidget(self.add_dir_btn)
        top_layout.addWidget(self.clear_btn)
        top_layout.addStretch()

        layout.addLayout(top_layout)

        # Output Folder selector
        folder_box = QGroupBox("Destination Directory")
        f_layout = QHBoxLayout(folder_box)
        self.folder_label = QLabel(self.output_dir)
        self.folder_label.setStyleSheet("color: #38bdf8; font-weight: 500;")
        browse_folder_btn = QPushButton("Change Folder...")
        browse_folder_btn.clicked.connect(self._change_output_dir)
        f_layout.addWidget(self.folder_label, 1)
        f_layout.addWidget(browse_folder_btn)
        layout.addWidget(folder_box)

        # Batch Table
        self.table = QTableWidget()
        self.table.setColumnCount(3)
        self.table.setHorizontalHeaderLabels(["Filename", "File Size", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        self.table.verticalHeader().hide()
        layout.addWidget(self.table)

        # Progress & Start Bar
        bottom_layout = QHBoxLayout()
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.status_label = QLabel("Ready")
        self.status_label.setStyleSheet("color: #94a3b8; font-size: 12px;")

        self.start_btn = QPushButton("🚀 Start Batch Colorization")
        self.start_btn.setObjectName("primaryBtn")
        self.start_btn.clicked.connect(self._start_batch)

        bottom_layout.addWidget(self.status_label)
        bottom_layout.addWidget(self.progress_bar, 1)
        bottom_layout.addWidget(self.start_btn)

        layout.addLayout(bottom_layout)

    def _add_files(self):
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Select Photographs for Batch Colorization",
            "",
            "Images (*.jpg *.jpeg *.png *.tif *.tiff *.bmp *.webp)"
        )
        for f in files:
            if f not in self.file_list:
                self.file_list.append(f)
        self._refresh_table()

    def _add_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Folder with Photographs")
        if folder:
            for root, _, files in os.walk(folder):
                for f in files:
                    if ImageLoader.is_supported(f):
                        full = os.path.join(root, f)
                        if full not in self.file_list:
                            self.file_list.append(full)
            self._refresh_table()

    def _clear_list(self):
        self.file_list.clear()
        self._refresh_table()

    def _change_output_dir(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Output Directory", self.output_dir)
        if folder:
            self.output_dir = folder
            self.folder_label.setText(folder)

    def _refresh_table(self):
        self.table.setRowCount(len(self.file_list))
        for row, path in enumerate(self.file_list):
            filename = os.path.basename(path)
            size_kb = round(os.path.getsize(path) / 1024, 1)
            self.table.setItem(row, 0, QTableWidgetItem(filename))
            self.table.setItem(row, 1, QTableWidgetItem(f"{size_kb} KB"))
            self.table.setItem(row, 2, QTableWidgetItem("Queued"))

    def _start_batch(self):
        if not self.file_list:
            QMessageBox.information(self, "Queue Empty", "Please add at least one photograph to the queue.")
            return

        self.start_btn.setEnabled(False)
        self.progress_bar.setValue(0)
        self.status_label.setText("Starting GPU batch inference...")

        options = {
            "model": "ddcolor",
            "quality": "high",
            "strength": "natural"
        }

        self.worker = BatchColorizeWorker(self.file_list, self.output_dir, options)
        self.worker.overall_progress.connect(self._on_progress)
        self.worker.item_finished.connect(self._on_item_finished)
        self.worker.batch_completed.connect(self._on_completed)
        self.worker.start()

    def _on_progress(self, current, total, text):
        pct = int((current / total) * 100)
        self.progress_bar.setValue(pct)
        self.status_label.setText(text)

    def _on_item_finished(self, input_path, output_path):
        for row, path in enumerate(self.file_list):
            if path == input_path:
                status_item = QTableWidgetItem("✅ Completed")
                status_item.setForeground(Qt.green)
                self.table.setItem(row, 2, status_item)

    def _on_completed(self, success, total):
        self.start_btn.setEnabled(True)
        self.status_label.setText(f"Batch finished! ({success}/{total} successful)")
        QMessageBox.information(
            self,
            "Batch Complete",
            f"Successfully processed {success} of {total} photographs.\nSaved to: {self.output_dir}"
        )
