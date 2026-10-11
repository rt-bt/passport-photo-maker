import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Paintbrush, Undo2, Redo2, Check, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';

interface ManualEraserBrushProps {
  originalImage: string;
  cutoutImage: string;
  onSave: (newDataUrl: string) => void;
  onCancel: () => void;
}

export const ManualEraserBrush: React.FC<ManualEraserBrushProps> = ({
  originalImage,
  cutoutImage,
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState<number>(20);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const origImgRef = useRef<HTMLImageElement | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Save initial state to history
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
      setHistoryIndex(0);
    };
    img.src = cutoutImage;

    // Load original image for restore mode
    const orig = new Image();
    orig.crossOrigin = 'anonymous';
    orig.onload = () => {
      origImgRef.current = orig;
    };
    orig.src = originalImage;
  }, [cutoutImage, originalImage]);

  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    // Limit history stack
    if (newHistory.length > 15) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history[newIdx]) {
        ctx.putImageData(history[newIdx], 0, 0);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history[newIdx]) {
        ctx.putImageData(history[newIdx], 0, 0);
      }
    }
  };

  const draw = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.save();
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, (brushSize * scaleX) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (mode === 'restore' && origImgRef.current) {
      // Create circular clipping path and paint from original image
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, (brushSize * scaleX) / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(origImgRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    draw(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDrawing) {
      draw(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Brush Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('erase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'erase'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Erase
          </button>
          <button
            onClick={() => setMode('restore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'restore'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Restore
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="w-44">
          <Slider
            label="Brush Size"
            value={brushSize}
            min={5}
            max={60}
            unit="px"
            onChange={setBrushSize}
          />
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Brush Canvas Area with checkerboard background */}
      <div className="relative w-full max-h-[460px] overflow-auto flex items-center justify-center p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] dark:bg-slate-900">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="max-h-[420px] w-auto h-auto object-contain shadow-md cursor-crosshair touch-none select-none"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleDone}>
          Apply Touch-ups
        </Button>
      </div>
    </div>
  );
};
