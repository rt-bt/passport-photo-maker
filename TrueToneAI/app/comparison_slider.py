"""
Comparison Slider Widget for TrueTone AI
Interactive Before/After split comparison with smooth mouse dragging and badge overlays.
"""

from PySide6.QtWidgets import QWidget
from PySide6.QtGui import QPainter, QPixmap, QColor, QPen, QBrush, QFont, QMouseEvent, QPainterPath
from PySide6.QtCore import Qt, QRect, QPoint, Signal


class ComparisonSlider(QWidget):
    split_changed = Signal(float)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMouseTracking(True)
        self.split_ratio = 0.5 # 0.0 to 1.0 (50% default)
        self.original_pixmap: QPixmap = QPixmap()
        self.colorized_pixmap: QPixmap = QPixmap()
        self._dragging = False
        self.setMinimumSize(320, 240)

    def set_images(self, original_pixmap: QPixmap, colorized_pixmap: QPixmap):
        self.original_pixmap = original_pixmap
        self.colorized_pixmap = colorized_pixmap
        self.update()

    def set_split_ratio(self, ratio: float):
        self.split_ratio = max(0.0, min(1.0, ratio))
        self.split_changed.emit(self.split_ratio)
        self.update()

    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.LeftButton:
            self._dragging = True
            self._update_split_from_pos(event.position().x())

    def mouseMoveEvent(self, event: QMouseEvent):
        if self._dragging:
            self._update_split_from_pos(event.position().x())
        else:
            split_x = int(self.width() * self.split_ratio)
            if abs(event.position().x() - split_x) <= 12:
                self.setCursor(Qt.SplitHCursor)
            else:
                self.setCursor(Qt.ArrowCursor)

    def mouseReleaseEvent(self, event: QMouseEvent):
        if event.button() == Qt.LeftButton:
            self._dragging = False

    def _update_split_from_pos(self, x: float):
        w = max(1, self.width())
        new_ratio = max(0.01, min(0.99, x / w))
        self.set_split_ratio(new_ratio)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setRenderHint(QPainter.SmoothPixmapTransform)

        w = self.width()
        h = self.height()

        if self.original_pixmap.isNull():
            # Empty state background
            painter.fillRect(0, 0, w, h, QColor("#121417"))
            return

        # Compute aspect ratio fit
        orig_w = self.original_pixmap.width()
        orig_h = self.original_pixmap.height()

        scale = min(w / orig_w, h / orig_h)
        disp_w = int(orig_w * scale)
        disp_h = int(orig_h * scale)
        offset_x = (w - disp_w) // 2
        offset_y = (h - disp_h) // 2

        target_rect = QRect(offset_x, offset_y, disp_w, disp_h)

        # Draw full colorized image as base
        if not self.colorized_pixmap.isNull():
            painter.drawPixmap(target_rect, self.colorized_pixmap)
        else:
            painter.drawPixmap(target_rect, self.original_pixmap)

        # Clip left side to split position to draw original B&W image
        split_x = int(w * self.split_ratio)
        if split_x > offset_x:
            clip_w = min(disp_w, split_x - offset_x)
            if clip_w > 0:
                painter.save()
                clip_rect = QRect(offset_x, offset_y, clip_w, disp_h)
                painter.setClipRect(clip_rect)
                painter.drawPixmap(target_rect, self.original_pixmap)
                painter.restore()

        # Draw vertical separator line
        line_x = max(offset_x, min(offset_x + disp_w, split_x))
        pen = QPen(QColor("#ffffff"), 2)
        painter.setPen(pen)
        painter.drawLine(line_x, offset_y, line_x, offset_y + disp_h)

        # Draw center circular handle
        handle_y = offset_y + disp_h // 2
        handle_radius = 16

        # Outer glow
        painter.setPen(Qt.NoPen)
        painter.setBrush(QColor(56, 189, 248, 180)) # Cyan accent
        painter.drawEllipse(QPoint(line_x, handle_y), handle_radius + 2, handle_radius + 2)

        # Handle body
        painter.setBrush(QColor("#1e232d"))
        painter.drawEllipse(QPoint(line_x, handle_y), handle_radius, handle_radius)

        # Arrows inside handle
        painter.setPen(QPen(QColor("#ffffff"), 2))
        painter.drawLine(line_x - 6, handle_y, line_x - 3, handle_y - 4)
        painter.drawLine(line_x - 6, handle_y, line_x - 3, handle_y + 4)
        painter.drawLine(line_x + 6, handle_y, line_x + 3, handle_y - 4)
        painter.drawLine(line_x + 6, handle_y, line_x + 3, handle_y + 4)

        # Badges: BEFORE & AFTER
        badge_font = QFont("Segoe UI", 9, QFont.Bold)
        painter.setFont(badge_font)

        # Before Badge (Top Left)
        if split_x > offset_x + 60:
            before_rect = QRect(offset_x + 14, offset_y + 14, 76, 26)
            painter.setPen(Qt.NoPen)
            painter.setBrush(QColor(18, 20, 24, 210))
            painter.drawRoundedRect(before_rect, 6, 6)
            painter.setPen(QColor("#cbd5e1"))
            painter.drawText(before_rect, Qt.AlignCenter, "ORIGINAL")

        # After Badge (Top Right)
        if split_x < offset_x + disp_w - 60 and not self.colorized_pixmap.isNull():
            after_rect = QRect(offset_x + disp_w - 90, offset_y + 14, 76, 26)
            painter.setPen(Qt.NoPen)
            painter.setBrush(QColor(79, 70, 229, 220)) # Indigo
            painter.drawRoundedRect(after_rect, 6, 6)
            painter.setPen(QColor("#ffffff"))
            painter.drawText(after_rect, Qt.AlignCenter, "TRUETONE")
