import React from 'react';
import { RotateCcw } from 'lucide-react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
  defaultValue?: number;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onReset,
  defaultValue = 0,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
        <span>{label}</span>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {value > 0 && min < 0 ? `+${value}` : value}
            {unit}
          </span>
          {onReset && value !== defaultValue && (
            <button
              onClick={onReset}
              title="Reset to default"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};
