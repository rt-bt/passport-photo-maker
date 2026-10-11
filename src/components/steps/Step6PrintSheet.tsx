import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileDown,
  Image as ImageIcon,
  Sliders,
  Check,
  AlertCircle,
  ArrowRight,
  Maximize2,
  Copy,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { PrintCanvasPreview } from '../features/PrintCanvasPreview';
import { useI18n } from '../../i18n';
import { SheetSettings, PassportPreset, PaperSize } from '../../types';
import { PAPER_SIZES } from '../../lib/presets';
import { calculateSheetLayout } from '../../lib/sheetLayout';
import { downloadPrintPdf } from '../../lib/pdfExport';
import { mmToPx } from '../../lib/units';

interface Step6PrintSheetProps {
  photoDataUrl: string;
  preset: PassportPreset;
  dpi: number;
  onNext: () => void;
  onBack: () => void;
}

export const Step6PrintSheet: React.FC<Step6PrintSheetProps> = ({
  photoDataUrl,
  preset,
  dpi,
  onNext,
  onBack,
}) => {
  const { t } = useI18n();

  const [sheetSettings, setSheetSettings] = useState<SheetSettings>({
    paperSizeId: 'a4',
    orientation: 'portrait',
    marginMm: 10,
    gapMm: 3,
    copies: 8,
    fillSheet: false,
    showBorders: true,
    borderColor: '#9CA3AF',
    borderWidthMm: 0.2,
    showCutMarks: true,
  });

  const selectedPaper: PaperSize =
    PAPER_SIZES.find((p) => p.id === sheetSettings.paperSizeId) || PAPER_SIZES[0];

  // Calculate layout
  const layout = useMemo(() => {
    return calculateSheetLayout({
      paperWidthMm: selectedPaper.widthMm,
      paperHeightMm: selectedPaper.heightMm,
      photoWidthMm: preset.widthMm,
      photoHeightMm: preset.heightMm,
      orientation: sheetSettings.orientation,
      marginMm: sheetSettings.marginMm,
      gapMm: sheetSettings.gapMm,
      copies: sheetSettings.copies,
      fillSheet: sheetSettings.fillSheet,
      showCutMarks: sheetSettings.showCutMarks,
    });
  }, [selectedPaper, preset, sheetSettings]);

  // Download high-resolution print PDF
  const handleDownloadPdf = async () => {
    await downloadPrintPdf(
      {
        layout,
        photoDataUrl,
        showBorders: sheetSettings.showBorders,
        borderColor: sheetSettings.borderColor,
        borderWidthMm: sheetSettings.borderWidthMm,
        showCutMarks: sheetSettings.showCutMarks,
      },
      `passport-sheet-${preset.id}-${selectedPaper.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`
    );
  };

  // Download 300 DPI high-resolution sheet image
  const handleDownloadSheetImage = () => {
    const scale = dpi / 25.4; // exact pixels per mm at current DPI
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(layout.paperWidthMm * scale);
    canvas.height = Math.round(layout.paperHeightMm * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw photos
      for (const slot of layout.slots) {
        const x = slot.xMm * scale;
        const y = slot.yMm * scale;
        const w = slot.widthMm * scale;
        const h = slot.heightMm * scale;
        ctx.drawImage(img, x, y, w, h);

        if (sheetSettings.showBorders) {
          ctx.strokeStyle = sheetSettings.borderColor;
          ctx.lineWidth = Math.max(1, Math.round(sheetSettings.borderWidthMm * scale));
          ctx.strokeRect(x, y, w, h);
        }
      }

      // Draw cut marks
      if (sheetSettings.showCutMarks && layout.cutMarks.length > 0) {
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const mark of layout.cutMarks) {
          ctx.moveTo(mark.x1 * scale, mark.y1 * scale);
          ctx.lineTo(mark.x2 * scale, mark.y2 * scale);
        }
        ctx.stroke();
      }

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.95);
      a.download = `passport-sheet-${preset.id}-${selectedPaper.id}.jpg`;
      a.click();
    };
    img.src = photoDataUrl;
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('sheet.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('sheet.subtitle')}
          </p>
        </div>

        {/* Max fit pill */}
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Copy className="w-4 h-4" />
          <span>{t('sheet.maxFit', { count: layout.maxPhotos })}</span>
        </div>
      </div>

      {/* Crucial Print Tip Alert */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <strong className="block mb-0.5">{t('sheet.printTip')}</strong>
          Printer dialog settings must be set to <strong>100% / Actual Size</strong>. Any "Fit to page" or automatic scaling will alter the physical passport dimensions.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Canvas Preview */}
        <div className="lg:col-span-6 p-6 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <PrintCanvasPreview
            layout={layout}
            photoDataUrl={photoDataUrl}
            showBorders={sheetSettings.showBorders}
            borderColor={sheetSettings.borderColor}
            borderWidthMm={sheetSettings.borderWidthMm}
            showCutMarks={sheetSettings.showCutMarks}
          />

          <div className="mt-4 text-center text-xs text-slate-500 font-mono">
            {selectedPaper.name} ({layout.paperWidthMm} × {layout.paperHeightMm} mm) —{' '}
            {layout.activeCount} photos ({layout.cols} columns × {layout.rows} rows)
          </div>
        </div>

        {/* Right Column: Sheet Configuration Controls */}
        <div className="lg:col-span-6 space-y-5">
          {/* Paper Size & Orientation Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('sheet.paperSize')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAPER_SIZES.map((paper) => {
                const isSelected = sheetSettings.paperSizeId === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() =>
                      setSheetSettings({ ...sheetSettings, paperSizeId: paper.id })
                    }
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>{paper.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {paper.widthMm}×{paper.heightMm} mm
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Orientation */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('sheet.orientation')}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() =>
                    setSheetSettings({ ...sheetSettings, orientation: 'portrait' })
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sheetSettings.orientation === 'portrait'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sheet.portrait')}
                </button>
                <button
                  onClick={() =>
                    setSheetSettings({ ...sheetSettings, orientation: 'landscape' })
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sheetSettings.orientation === 'landscape'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('sheet.landscape')}
                </button>
              </div>
            </div>
          </div>

          {/* Copies & Fill Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('sheet.copies')}
              </h3>
              <Button
                variant={sheetSettings.fillSheet ? 'primary' : 'outline'}
                size="sm"
                icon={<Maximize2 className="w-3.5 h-3.5" />}
                onClick={() =>
                  setSheetSettings({
                    ...sheetSettings,
                    fillSheet: !sheetSettings.fillSheet,
                    copies: layout.maxPhotos,
                  })
                }
              >
                {t('sheet.fillPage')} ({layout.maxPhotos})
              </Button>
            </div>

            {!sheetSettings.fillSheet && (
              <Slider
                label="Selected Copies"
                value={sheetSettings.copies}
                min={1}
                max={layout.maxPhotos}
                onChange={(v) => setSheetSettings({ ...sheetSettings, copies: v })}
              />
            )}

            {/* Margins & Gaps */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Slider
                label={t('sheet.margins')}
                value={sheetSettings.marginMm}
                min={2}
                max={25}
                unit="mm"
                onChange={(v) => setSheetSettings({ ...sheetSettings, marginMm: v })}
              />
              <Slider
                label={t('sheet.gaps')}
                value={sheetSettings.gapMm}
                min={1}
                max={15}
                unit="mm"
                onChange={(v) => setSheetSettings({ ...sheetSettings, gapMm: v })}
              />
            </div>

            {/* Checkbox toggles: Borders and Cut Marks */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={sheetSettings.showBorders}
                  onChange={(e) =>
                    setSheetSettings({ ...sheetSettings, showBorders: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{t('sheet.borders')}</span>
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={sheetSettings.showCutMarks}
                  onChange={(e) =>
                    setSheetSettings({ ...sheetSettings, showCutMarks: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{t('sheet.cutMarks')}</span>
              </label>
            </div>
          </div>

          {/* Export Sheet Action Buttons */}
          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Export Sheet Options
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="primary"
                size="md"
                icon={<FileDown className="w-4 h-4" />}
                onClick={handleDownloadPdf}
              >
                {t('sheet.downloadPdf')}
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<ImageIcon className="w-4 h-4" />}
                onClick={handleDownloadSheetImage}
              >
                {t('sheet.downloadImage')}
              </Button>
            </div>
            <Button
              variant="outline"
              size="md"
              className="w-full bg-white dark:bg-slate-900"
              icon={<Printer className="w-4 h-4" />}
              onClick={handleBrowserPrint}
            >
              {t('sheet.printNow')} (100% Scale)
            </Button>
          </div>
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
