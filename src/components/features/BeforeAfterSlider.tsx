import React, { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  aspectRatio?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  aspectRatio = 35 / 45,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full max-w-xl sm:max-w-2xl mx-auto overflow-hidden rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 select-none cursor-ew-resize bg-slate-100 dark:bg-slate-900"
      style={{ aspectRatio }}
    >
      {/* Background/After Image (Full width base) */}
      <img
        src={afterUrl}
        alt="Restored photo"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-[11px] font-bold text-white tracking-wider shadow-md">
        RESTORED (AFTER)
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeUrl}
          alt="Original photo"
          className="absolute inset-0 max-w-none h-full object-contain"
          style={{
            width: containerWidth ? `${containerWidth}px` : '100%',
          }}
          draggable={false}
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-[11px] font-bold text-white tracking-wider shadow-md">
          ORIGINAL (BEFORE)
        </div>
      </div>

      {/* Divider line and handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-ew-resize flex items-center justify-center -translate-x-1/2 z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-9 h-9 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center border-2 border-indigo-500">
          <MoveHorizontal className="w-4 h-4 text-indigo-600" />
        </div>
      </div>
    </div>
  );
};
