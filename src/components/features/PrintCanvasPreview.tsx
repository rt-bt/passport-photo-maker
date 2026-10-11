import React, { useRef, useEffect } from 'react';
import { SheetLayoutResult } from '../../lib/sheetLayout';

interface PrintCanvasPreviewProps {
  layout: SheetLayoutResult;
  photoDataUrl: string;
  showBorders?: boolean;
  borderColor?: string;
  borderWidthMm?: number;
  showCutMarks?: boolean;
}

export const PrintCanvasPreview: React.FC<PrintCanvasPreviewProps> = ({
  layout,
  photoDataUrl,
  showBorders = false,
  borderColor = '#9CA3AF',
  showCutMarks = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render resolution: set canvas size to proportional high resolution
    const scale = 3; // 3 pixels per mm for sharp preview
    canvas.width = Math.round(layout.paperWidthMm * scale);
    canvas.height = Math.round(layout.paperHeightMm * scale);

    // 1. Draw paper background (clean white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Load photo image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 3. Draw each slot
      for (const slot of layout.slots) {
        const x = slot.xMm * scale;
        const y = slot.yMm * scale;
        const w = slot.widthMm * scale;
        const h = slot.heightMm * scale;

        ctx.drawImage(img, x, y, w, h);

        if (showBorders) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }
      }

      // 4. Draw cut marks
      if (showCutMarks && layout.cutMarks.length > 0) {
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const mark of layout.cutMarks) {
          ctx.moveTo(mark.x1 * scale, mark.y1 * scale);
          ctx.lineTo(mark.x2 * scale, mark.y2 * scale);
        }
        ctx.stroke();
      }
    };
    img.src = photoDataUrl;
  }, [layout, photoDataUrl, showBorders, borderColor, showCutMarks]);

  const paperAspectRatio = layout.paperWidthMm / layout.paperHeightMm;

  return (
    <div
      id="printable-sheet-area"
      className="relative mx-auto bg-white shadow-2xl rounded-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={{
        maxWidth: '460px',
        aspectRatio: `${paperAspectRatio}`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain block select-none"
      />
    </div>
  );
};
