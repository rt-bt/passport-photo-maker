import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  Type,
  PenTool,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { NameDateOverlay } from '../features/NameDateOverlay';
import { SignatureManager } from '../features/SignatureManager';
import { useI18n } from '../../i18n';
import {
  PhotoAdjustments,
  CompressionSettings,
  NameDateSettings,
  SignatureSettings,
  PassportPreset,
} from '../../types';
import { TARGET_SIZE_PRESETS } from '../../lib/presets';
import { applyAdjustments } from '../../lib/imageFilters';
import { compressToTargetSize, CompressResult } from '../../lib/compression';
import { formatBytes, mmToPx } from '../../lib/units';

interface Step5AdjustCompressProps {
  inputImage: string;
  preset: PassportPreset;
  dpi: number;
  originalSizeBytes: number;
  onComplete: (finalDataUrl: string, compressResult: CompressResult) => void;
  onBack: () => void;
}

export const Step5AdjustCompress: React.FC<Step5AdjustCompressProps> = ({
  inputImage,
  preset,
  dpi,
  originalSizeBytes,
  onComplete,
  onBack,
}) => {
  const { t } = useI18n();

  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    smoothness: 0,
    rotation: 0,
    fineRotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  const [compression, setCompression] = useState<CompressionSettings>({
    targetSizeKb: 50, // default good size for government portals
    format: 'image/jpeg',
    dpi: dpi as 150 | 300 | 600,
  });

  const [nameDate, setNameDate] = useState<NameDateSettings>({
    enabled: false,
    name: '',
    date: new Date().toLocaleDateString('en-GB'),
    font: 'Arial, sans-serif',
    fontSize: 14,
    bannerHeightMm: 6,
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
  });

  const [signature, setSignature] = useState<SignatureSettings>({
    enabled: false,
    dataUrl: null,
    widthMm: 35,
    heightMm: 15,
    threshold: 200,
  });

  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressResult, setCompressResult] = useState<CompressResult | null>(null);

  const targetWidthPx = mmToPx(preset.widthMm, dpi);
  const targetHeightPx = mmToPx(preset.heightMm, dpi);

  // Re-run adjustments & compression when settings change
  useEffect(() => {
    let active = true;
    const processImage = async () => {
      setIsCompressing(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidthPx;
        canvas.height = targetHeightPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw base image
        ctx.drawImage(img, 0, 0, targetWidthPx, targetHeightPx);

        // Apply filters
        applyAdjustments(ctx, targetWidthPx, targetHeightPx, adjustments);

        // Add Name and Date Banner if enabled
        if (nameDate.enabled && (nameDate.name || nameDate.date)) {
          const bannerHeightPx = mmToPx(nameDate.bannerHeightMm, dpi);
          const bannerY = targetHeightPx - bannerHeightPx;

          ctx.fillStyle = nameDate.backgroundColor || '#FFFFFF';
          ctx.fillRect(0, bannerY, targetWidthPx, bannerHeightPx);
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, bannerY, targetWidthPx, bannerHeightPx);

          ctx.fillStyle = nameDate.textColor || '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.round(bannerHeightPx * 0.35)}px sans-serif`;

          if (nameDate.name && nameDate.date) {
            ctx.fillText(nameDate.name, targetWidthPx / 2, bannerY + bannerHeightPx * 0.33);
            ctx.font = `normal ${Math.round(bannerHeightPx * 0.28)}px sans-serif`;
            ctx.fillText(`DOP: ${nameDate.date}`, targetWidthPx / 2, bannerY + bannerHeightPx * 0.72);
          } else {
            ctx.fillText(nameDate.name || nameDate.date, targetWidthPx / 2, bannerY + bannerHeightPx / 2);
          }
        }

        // Run binary search compression
        try {
          const res = await compressToTargetSize({
            canvas,
            targetSizeKb: compression.targetSizeKb,
            format: compression.format,
          });
          if (active) {
            setCompressResult(res);
            setIsCompressing(false);
          }
        } catch (err) {
          console.error('Compression error:', err);
          setIsCompressing(false);
        }
      };
      img.src = inputImage;
    };

    const timer = setTimeout(processImage, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputImage, adjustments, compression, nameDate, targetWidthPx, targetHeightPx, dpi]);

  const handleNext = () => {
    if (compressResult) {
      onComplete(compressResult.dataUrl, compressResult);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('adjust.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('adjust.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left column: Live preview & compression statistics */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 max-h-[380px]"
            style={{ aspectRatio: `${preset.widthMm} / ${preset.heightMm}` }}
          >
            {compressResult && (
              <img
                src={compressResult.dataUrl}
                alt="Adjusted passport"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Size Comparison Badge */}
          {compressResult && (
            <div className="mt-5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Original Upload:</span>
                <span className="font-mono">{formatBytes(originalSizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Final Output Size:</span>
                <span className="font-mono text-sm">{formatBytes(compressResult.sizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                <span>Dimensions:</span>
                <span>
                  {compressResult.width} × {compressResult.height} px ({dpi} DPI)
                </span>
              </div>
              {compression.targetSizeKb && (
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-1">
                  Target limit: Under {compression.targetSizeKb} KB — Quality: {Math.round(compressResult.quality * 100)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Sliders & Compression Controls */}
        <div className="space-y-5">
          {/* Filters Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Portrait Enhancements
            </h3>
            <Slider
              label={t('adjust.brightness')}
              value={adjustments.brightness}
              min={-50}
              max={50}
              onChange={(v) => setAdjustments({ ...adjustments, brightness: v })}
              onReset={() => setAdjustments({ ...adjustments, brightness: 0 })}
            />
            <Slider
              label={t('adjust.contrast')}
              value={adjustments.contrast}
              min={-50}
              max={50}
              onChange={(v) => setAdjustments({ ...adjustments, contrast: v })}
              onReset={() => setAdjustments({ ...adjustments, contrast: 0 })}
            />
            <Slider
              label={t('adjust.sharpness')}
              value={adjustments.sharpness}
              min={0}
              max={100}
              onChange={(v) => setAdjustments({ ...adjustments, sharpness: v })}
              onReset={() => setAdjustments({ ...adjustments, sharpness: 0 })}
            />
            <Slider
              label={t('adjust.skinSmooth')}
              value={adjustments.smoothness}
              min={0}
              max={100}
              onChange={(v) => setAdjustments({ ...adjustments, smoothness: v })}
              onReset={() => setAdjustments({ ...adjustments, smoothness: 0 })}
            />
          </div>

          {/* Compression & Target Size Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('adjust.targetSize')}
            </h3>

            {/* Target presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_SIZE_PRESETS.map((target) => {
                const isSelected = compression.targetSizeKb === target.value;
                return (
                  <button
                    key={target.label}
                    onClick={() =>
                      setCompression({ ...compression, targetSizeKb: target.value })
                    }
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {target.label}
                  </button>
                );
              })}
            </div>

            {/* Format Picker */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('adjust.format')}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setCompression({ ...compression, format: fmt })}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      compression.format === fmt
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Name & Date Banner */}
          <NameDateOverlay settings={nameDate} onChange={setNameDate} />

          {/* Optional Signature Manager */}
          <SignatureManager settings={signature} onChange={setSignature} />
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
          loading={isCompressing}
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={handleNext}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
