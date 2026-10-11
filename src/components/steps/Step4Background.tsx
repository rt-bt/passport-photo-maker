import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Palette,
  Eraser,
  Sliders,
  ArrowRight,
  Eye,
  Check,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { BeforeAfterSlider } from '../features/BeforeAfterSlider';
import { ManualEraserBrush } from '../features/ManualEraserBrush';
import { useI18n } from '../../i18n';
import { BackgroundSettings, PassportPreset } from '../../types';
import { BACKGROUND_COLORS } from '../../lib/presets';
import { removeImageBackground, compositeBackground } from '../../lib/backgroundRemoval';
import { mmToPx } from '../../lib/units';

interface Step4BackgroundProps {
  croppedImage: string;
  preset: PassportPreset;
  dpi: number;
  onComplete: (compositedDataUrl: string) => void;
  onBack: () => void;
}

export const Step4Background: React.FC<Step4BackgroundProps> = ({
  croppedImage,
  preset,
  dpi,
  onComplete,
  onBack,
}) => {
  const { t } = useI18n();

  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [compositedPreview, setCompositedPreview] = useState<string>(croppedImage);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressKey, setProgressKey] = useState<string>('');

  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [showManualBrush, setShowManualBrush] = useState<boolean>(false);

  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    mode: 'solid',
    solidColor: preset.recommendedBgColor || '#FFFFFF',
    gradientStart: '#FFFFFF',
    gradientEnd: '#D4E6F1',
    gradientAngle: 180,
    featherRadius: 1,
  });

  const targetWidth = mmToPx(preset.widthMm, dpi);
  const targetHeight = mmToPx(preset.heightMm, dpi);

  // Trigger AI background removal
  const handleRemoveBackground = async () => {
    setIsRemoving(true);
    setProgress(0);
    try {
      const blob = await removeImageBackground(croppedImage, (p) => {
        setProgress(p.percentage);
        setProgressKey(p.key);
      });
      const url = URL.createObjectURL(blob);
      setCutoutUrl(url);
    } catch (err) {
      console.error('Background removal error:', err);
      // Fallback: use cropped image as cutout if model fails
      setCutoutUrl(croppedImage);
    } finally {
      setIsRemoving(false);
    }
  };

  // Re-composite when settings or cutout changes
  useEffect(() => {
    let active = true;
    const updateComposite = async () => {
      if (!cutoutUrl) {
        setCompositedPreview(croppedImage);
        return;
      }
      try {
        const result = await compositeBackground(
          cutoutUrl,
          bgSettings,
          targetWidth,
          targetHeight
        );
        if (active) {
          setCompositedPreview(result);
        }
      } catch (err) {
        console.error('Composite failed', err);
      }
    };
    updateComposite();
    return () => {
      active = false;
    };
  }, [cutoutUrl, bgSettings, croppedImage, targetWidth, targetHeight]);

  const handleBrushSave = (newCutout: string) => {
    setCutoutUrl(newCutout);
    setShowManualBrush(false);
  };

  const handleNext = () => {
    onComplete(compositedPreview);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('background.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('background.subtitle')}
          </p>
        </div>

        {/* AI Remove Button */}
        {!cutoutUrl && (
          <Button
            variant="primary"
            size="md"
            loading={isRemoving}
            icon={<Sparkles className="w-4 h-4 text-amber-300" />}
            onClick={handleRemoveBackground}
          >
            {t('background.removeBgBtn')}
          </Button>
        )}
      </div>

      {/* Progress status if background is being processed */}
      {isRemoving && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('background.processingBg')} {progressKey && `(${progressKey})`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Preview Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
          {showBeforeAfter && cutoutUrl ? (
            <BeforeAfterSlider
              beforeUrl={croppedImage}
              afterUrl={compositedPreview}
              aspectRatio={preset.widthMm / preset.heightMm}
            />
          ) : (
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 max-h-[380px]"
              style={{ aspectRatio: `${preset.widthMm} / ${preset.heightMm}` }}
            >
              <img
                src={compositedPreview}
                alt="Passport preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Sub-controls under preview */}
          {cutoutUrl && (
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant={showBeforeAfter ? 'primary' : 'outline'}
                size="sm"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              >
                {t('background.beforeAfter')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Eraser className="w-3.5 h-3.5" />}
                onClick={() => setShowManualBrush(true)}
              >
                {t('background.manualBrush')}
              </Button>
            </div>
          )}
        </div>

        {/* Color and Feathering Options */}
        <div className="space-y-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {t('background.presetColors')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUND_COLORS.map((col) => {
                const isSelected =
                  bgSettings.mode === 'solid' && bgSettings.solidColor === col.hex;

                return (
                  <button
                    key={col.name}
                    onClick={() => {
                      if (col.hex === 'transparent') {
                        setBgSettings({ ...bgSettings, mode: 'transparent' });
                      } else {
                        setBgSettings({
                          ...bgSettings,
                          mode: 'solid',
                          solidColor: col.hex,
                        });
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                      style={{
                        backgroundColor:
                          col.hex === 'transparent' ? 'transparent' : col.hex,
                      }}
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('background.customColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgSettings.solidColor}
                onChange={(e) =>
                  setBgSettings({
                    ...bgSettings,
                    mode: 'solid',
                    solidColor: e.target.value,
                  })
                }
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={bgSettings.solidColor}
                onChange={(e) =>
                  setBgSettings({
                    ...bgSettings,
                    mode: 'solid',
                    solidColor: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase"
              />
            </div>
          </div>

          {/* Edge Refinement Slider */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Slider
              label={t('background.feather')}
              value={bgSettings.featherRadius}
              min={0}
              max={6}
              unit="px"
              onChange={(v) => setBgSettings({ ...bgSettings, featherRadius: v })}
            />
          </div>
        </div>
      </div>

      {/* Manual Eraser Brush Modal */}
      {showManualBrush && cutoutUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('background.manualBrush')}
            </h3>
            <ManualEraserBrush
              originalImage={croppedImage}
              cutoutImage={cutoutUrl}
              onSave={handleBrushSave}
              onCancel={() => setShowManualBrush(false)}
            />
          </div>
        </div>
      )}

      {/* Nav Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="md" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={handleNext}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
