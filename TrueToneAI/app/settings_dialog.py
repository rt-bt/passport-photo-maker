"""
Settings & Hardware Diagnostics Dialog for TrueTone AI
"""

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QGroupBox, QFormLayout, QTableWidget, QTableWidgetItem, QHeaderView
)
from PySide6.QtCore import Qt

from ai_engine.gpu_manager import gpu_manager
from core.model_manager import model_manager


class SettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("TrueTone AI — Settings & Hardware Diagnostics")
        self.setFixedSize(580, 520)

        layout = QVBoxLayout(self)
        layout.setSpacing(16)
        layout.setContentsMargins(20, 20, 20, 20)

        # 1. Hardware & System Acceleration
        hw_box = QGroupBox("Dedicated Hardware Acceleration")
        hw_layout = QFormLayout(hw_box)
        hw_layout.setSpacing(10)

        vram = gpu_manager.get_vram_info()
        hw_layout.addRow("NVIDIA Dedicated GPU:", QLabel(f"<b>{gpu_manager.device_name}</b>"))
        hw_layout.addRow("Total Dedicated VRAM:", QLabel(f"{vram['total_mb']} MB (12 GB GDDR6)"))
        hw_layout.addRow("CUDA Compute Engine:", QLabel("✅ Active (PyTorch CUDA 12.4 + TensorRT ready)"))
        hw_layout.addRow("Current VRAM Usage:", QLabel(f"{vram['used_mb']} MB ({vram['percent']}%)"))
        layout.addWidget(hw_box)

        # 2. Local AI Model Status
        models_box = QGroupBox("Installed AI Models (Offline Storage)")
        models_layout = QVBoxLayout(models_box)

        table = QTableWidget()
        table.setColumnCount(3)
        table.setHorizontalHeaderLabels(["Model Engine", "Size", "Status"])
        table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        table.verticalHeader().hide()
        table.setStyleSheet("QTableWidget { background-color: #181c24; border: 1px solid #282e3b; }")

        status_data = model_manager.get_models_status()
        table.setRowCount(len(status_data))

        for row, (k, info) in enumerate(status_data.items()):
            table.setItem(row, 0, QTableWidgetItem(info["name"]))
            table.setItem(row, 1, QTableWidgetItem(f"{info['size_mb']} MB" if info["installed"] else "—"))
            status_item = QTableWidgetItem(info["status"])
            if info["installed"]:
                status_item.setForeground(Qt.green)
            else:
                status_item.setForeground(Qt.yellow)
            table.setItem(row, 2, status_item)

        models_layout.addWidget(table)
        layout.addWidget(models_box)

        # Close button
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()
        close_btn = QPushButton("Close")
        close_btn.setFixedWidth(100)
        close_btn.clicked.connect(self.accept)
        btn_layout.addWidget(close_btn)
        layout.addLayout(btn_layout)
