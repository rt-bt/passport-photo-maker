import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { useI18n } from '../../i18n';
import { processUploadedFile } from '../../lib/exif';
import { formatBytes } from '../../lib/units';

interface Step1UploadProps {
  onImageLoaded: (dataUrl: string, originalSize: number) => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({ onImageLoaded }) => {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await processUploadedFile(file);
      onImageLoaded(result.dataUrl, result.originalSizeBytes);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please try a different photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Generate an instant high-quality sample portrait photo on canvas so users can test immediately
  const loadSamplePhoto = () => {
    setIsLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background wall
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 1200, 1500);

    // Subtle wall shadow
    const grad = ctx.createLinearGradient(0, 0, 1200, 1500);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 1500);

    // Torso / Suit
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(600, 1500, 520, 580, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shirt collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(510, 1020);
    ctx.lineTo(600, 1200);
    ctx.lineTo(690, 1020);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(520, 880, 160, 200);

    // Head / Face
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.ellipse(600, 680, 280, 360, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(600, 480, 310, 220, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.ellipse(490, 660, 24, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(710, 660, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(490, 640, 44, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(710, 640, 44, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(600, 800, 80, 0.2, Math.PI - 0.2);
    ctx.stroke();

    const sampleUrl = canvas.toDataURL('image/jpeg', 0.95);
    onImageLoaded(sampleUrl, 2500000); // simulate 2.5MB
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('upload.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('upload.subtitle')}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800 shadow-inner">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          {t('upload.dragDrop')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          {t('upload.supports')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="primary"
            size="md"
            loading={isLoading}
            icon={<ImageIcon className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('upload.browseBtn')}
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Camera className="w-4 h-4" />}
            onClick={() => cameraInputRef.current?.click()}
          >
            {t('upload.cameraBtn')}
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            onClick={loadSamplePhoto}
          >
            Try Sample Photo
          </Button>
        </div>
      </div>

      {/* Compliance Tips */}
      <div className="p-5 bg-blue-50/70 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-800 rounded-2xl">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
          {t('upload.tipsTitle')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>{t('upload.tip1')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>{t('upload.tip2')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>{t('upload.tip3')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>{t('upload.tip4')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
