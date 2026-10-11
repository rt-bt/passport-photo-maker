import React, { useEffect } from 'react';
import {
  Download,
  FileDown,
  Printer,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../common/Button';
import { useI18n } from '../../i18n';
import { PassportPreset } from '../../types';
import { CompressResult } from '../../lib/compression';
import { formatBytes, formatDimensions } from '../../lib/units';

interface Step7DownloadProps {
  finalPhotoUrl: string;
  preset: PassportPreset;
  dpi: number;
  compressResult: CompressResult | null;
  onRestart: () => void;
  onGoToSheet: () => void;
  onOpenCompliance: () => void;
}

export const Step7Download: React.FC<Step7DownloadProps> = ({
  finalPhotoUrl,
  preset,
  dpi,
  compressResult,
  onRestart,
  onGoToSheet,
  onOpenCompliance,
}) => {
  const { t } = useI18n();

  useEffect(() => {
    // Launch festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleDownloadSinglePhoto = () => {
    const a = document.createElement('a');
    a.href = finalPhotoUrl;
    a.download = `passport-${preset.id}-${preset.widthMm}x${preset.heightMm}mm.jpg`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center animate-in fade-in duration-300">
      {/* Success Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        Passport Photo Ready for Print & Submission
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Your Photo is Ready!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Created 100% in your browser. No data was uploaded anywhere.
        </p>
      </div>

      {/* Photo Preview & Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-6 text-left">
        <div
          className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 max-h-56 shrink-0"
          style={{ aspectRatio: `${preset.widthMm} / ${preset.heightMm}` }}
        >
          <img
            src={finalPhotoUrl}
            alt="Final passport"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3 flex-1 text-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {preset.name}
            </h4>
            <p className="text-slate-400 font-mono mt-0.5">
              {formatDimensions(preset.widthMm, preset.heightMm, dpi)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block">File Size:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {compressResult ? formatBytes(compressResult.sizeBytes) : 'Ready'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Resolution:</span>
              <span className="font-bold">{dpi} DPI</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenCompliance}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              View official compliance checklist
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-blue-500/20 text-base"
          icon={<Download className="w-5 h-5" />}
          onClick={handleDownloadSinglePhoto}
        >
          Download Single Photo ({preset.widthMm}×{preset.heightMm} mm)
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="w-full"
          icon={<Printer className="w-4 h-4" />}
          onClick={onGoToSheet}
        >
          Generate Print Sheet (A4 / 4×6 inch)
        </Button>
      </div>

      {/* Restart */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={onRestart}
        >
          {t('common.restart')} with another photo
        </Button>
      </div>
    </div>
  );
};
