import React from 'react';
import { Type, Calendar } from 'lucide-react';
import { NameDateSettings } from '../../types';
import { Slider } from '../common/Slider';

interface NameDateOverlayProps {
  settings: NameDateSettings;
  onChange: (settings: NameDateSettings) => void;
}

export const NameDateOverlay: React.FC<NameDateOverlayProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Add Name and Date Strip (Exam / Govt Form Standard)</span>
        </label>
      </div>

      {settings.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
          {/* Candidate Name input */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Candidate Name (ALL CAPS)
            </label>
            <div className="relative">
              <Type className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. JOHN DOE"
                value={settings.name}
                onChange={(e) => onChange({ ...settings, name: e.target.value.toUpperCase() })}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date of Photograph (DOP) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Date of Photo (DOP)
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. 11/10/2026"
                value={settings.date}
                onChange={(e) => onChange({ ...settings, date: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Strip Height */}
          <div className="sm:col-span-2">
            <Slider
              label="Strip Height"
              value={settings.bannerHeightMm}
              min={4}
              max={12}
              unit="mm"
              onChange={(v) => onChange({ ...settings, bannerHeightMm: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
