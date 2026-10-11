import React, { useState } from 'react';
import { Layers, Check, Sliders, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { useI18n } from '../../i18n';
import { PASSPORT_PRESETS } from '../../lib/presets';
import { PassportPreset, DimensionUnit } from '../../types';
import { mmToPx, toMm, formatDimensions } from '../../lib/units';

interface Step2PresetProps {
  selectedPreset: PassportPreset;
  onSelectPreset: (preset: PassportPreset) => void;
  dpi: 150 | 300 | 600;
  onChangeDpi: (dpi: 150 | 300 | 600) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenCompliance: () => void;
}

export const Step2Preset: React.FC<Step2PresetProps> = ({
  selectedPreset,
  onSelectPreset,
  dpi,
  onChangeDpi,
  onNext,
  onBack,
  onOpenCompliance,
}) => {
  const { t } = useI18n();

  // Custom size form state
  const [isCustom, setIsCustom] = useState<boolean>(selectedPreset.id === 'custom');
  const [customWidth, setCustomWidth] = useState<number>(35);
  const [customHeight, setCustomHeight] = useState<number>(45);
  const [customUnit, setCustomUnit] = useState<DimensionUnit>('mm');

  const handleCustomApply = () => {
    const widthMm = toMm(customWidth, customUnit, dpi);
    const heightMm = toMm(customHeight, customUnit, dpi);

    const customPreset: PassportPreset = {
      id: 'custom',
      name: `Custom (${customWidth}×${customHeight} ${customUnit})`,
      country: 'Custom',
      category: 'other',
      widthMm: Math.round(widthMm),
      heightMm: Math.round(heightMm),
      headHeightMinPercent: 70,
      headHeightMaxPercent: 80,
      recommendedBgColor: '#FFFFFF',
      description: `Custom format ${customWidth}×${customHeight} ${customUnit}`,
      complianceNotes: ['Custom user defined dimensions'],
    };

    setIsCustom(true);
    onSelectPreset(customPreset);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('preset.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('preset.subtitle')}
          </p>
        </div>

        {/* DPI Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs self-start">
          <span className="text-xs font-semibold text-slate-500 px-2">DPI:</span>
          {([150, 300, 600] as const).map((val) => (
            <button
              key={val}
              onClick={() => onChangeDpi(val)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                dpi === val
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {val} {val === 300 && '★'}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {PASSPORT_PRESETS.map((preset) => {
          const isSelected = !isCustom && selectedPreset.id === preset.id;
          const wPx = mmToPx(preset.widthMm, dpi);
          const hPx = mmToPx(preset.heightMm, dpi);

          return (
            <div
              key={preset.id}
              onClick={() => {
                setIsCustom(false);
                onSelectPreset(preset);
              }}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {preset.widthMm} × {preset.heightMm} mm
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {wPx} × {hPx} px ({dpi} DPI)
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {preset.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Size Form Drawer */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('preset.customSize')}
            </h3>
          </div>
          <button
            onClick={onOpenCompliance}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
          >
            <ShieldCheck className="w-4 h-4" />
            {t('preset.complianceAlert')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('preset.width')}
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('preset.height')}
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('preset.unit')}
            </label>
            <select
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value as DimensionUnit)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="mm">mm (Millimeters)</option>
              <option value="cm">cm (Centimeters)</option>
              <option value="inch">inch (Inches)</option>
              <option value="px">px (Pixels)</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant={isCustom ? 'primary' : 'outline'}
              size="sm"
              className="w-full"
              onClick={handleCustomApply}
            >
              Apply Custom Size
            </Button>
          </div>
        </div>

        {/* Selected specifications summary pill */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>
            Selected Size: <strong>{selectedPreset.name}</strong> — {formatDimensions(selectedPreset.widthMm, selectedPreset.heightMm, dpi)}
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            Head Ratio: {selectedPreset.headHeightMinPercent}% - {selectedPreset.headHeightMaxPercent}%
          </span>
        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="md" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={onNext}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
