import React from 'react';
import { CheckCircle2, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { PassportPreset } from '../../types';
import { PASSPORT_PRESETS } from '../../lib/presets';

interface ComplianceChecklistProps {
  currentPreset: PassportPreset;
  onSelectPreset?: (preset: PassportPreset) => void;
}

export const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({
  currentPreset,
  onSelectPreset,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Preset Country Header */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {currentPreset.name} ({currentPreset.widthMm} × {currentPreset.heightMm} mm)
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {currentPreset.description}
        </p>
      </div>

      {/* Official Checklist Items */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Official Guidelines Checklist
        </h5>
        <div className="space-y-2.5">
          {currentPreset.complianceNotes.map((note, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* General Rules Notice */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-semibold block mb-0.5">Common Rejection Reasons:</span>
          Glare on spectacles, hair covering forehead or eyes, open mouth / broad grin, shadows behind ears, or printing with 'Fit to page' scaling.
        </div>
      </div>

      {/* Quick switch to other country standards */}
      {onSelectPreset && (
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Switch Country Specification
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PASSPORT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 text-left rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  currentPreset.id === preset.id
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="truncate">{preset.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {preset.widthMm}×{preset.heightMm} mm
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
