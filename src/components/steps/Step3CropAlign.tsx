import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import {
  ZoomIn,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Info,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { FaceGuideOverlay } from '../features/FaceGuideOverlay';
import { useI18n } from '../../i18n';
import { PassportPreset, DetectedFace, ComplianceWarning } from '../../types';
import { detectFacesInImage, evaluateFaceCompliance, calculateAutoCrop } from '../../lib/faceDetection';
import { mmToPx } from '../../lib/units';

interface Step3CropAlignProps {
  imageSrc: string;
  preset: PassportPreset;
  dpi: number;
  onCropComplete: (croppedDataUrl: string) => void;
  onBack: () => void;
}

export const Step3CropAlign: React.FC<Step3CropAlignProps> = ({
  imageSrc,
  preset,
  dpi,
  onCropComplete,
  onBack,
}) => {
  const { t } = useI18n();

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [warnings, setWarnings] = useState<ComplianceWarning[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const aspectRatio = preset.widthMm / preset.heightMm;

  // Run face detection on image load
  useEffect(() => {
    let active = true;
    const runDetection = async () => {
      setIsDetecting(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        if (!active) return;
        const detected = await detectFacesInImage(img);
        if (active) {
          setFaces(detected);
          setIsDetecting(false);
        }
      };
      img.src = imageSrc;
    };
    runDetection();
    return () => {
      active = false;
    };
  }, [imageSrc]);

  // Evaluate compliance when crop or faces change
  useEffect(() => {
    if (croppedAreaPixels) {
      const w = evaluateFaceCompliance(faces, croppedAreaPixels, preset);
      setWarnings(w);
    }
  }, [faces, croppedAreaPixels, preset]);

  const onCropChange = (newCrop: Point) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // One-click Auto-Center Face
  const handleAutoCenter = () => {
    if (faces.length === 0) return;
    const img = new Image();
    img.onload = () => {
      const auto = calculateAutoCrop(faces[0], img.width, img.height, aspectRatio);
      setZoom(auto.zoom);
      setCrop({ x: auto.x, y: auto.y });
    };
    img.src = imageSrc;
  };

  // Generate cropped image on canvas at exact target resolution
  const handleProceed = () => {
    if (!croppedAreaPixels) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const targetWidth = mmToPx(preset.widthMm, dpi);
      const targetHeight = mmToPx(preset.heightMm, dpi);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Apply transformations if rotated/flipped
      if (flipH) {
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      onCropComplete(dataUrl);
    };
    img.src = imageSrc;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('crop.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('crop.subtitle')} ({preset.name} — {preset.widthMm}×{preset.heightMm} mm)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          loading={isDetecting}
          disabled={faces.length === 0}
          icon={<Sparkles className="w-4 h-4 text-blue-600" />}
          onClick={handleAutoCenter}
        >
          {t('crop.autoCenter')}
        </Button>
      </div>

      {/* Main Cropper Container with Face Guide Overlay */}
      <div className="relative w-full h-[440px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteInternal}
          showGrid={false}
          style={{
            containerStyle: { background: '#090d16' },
            cropAreaStyle: {
              border: '2px solid rgba(59, 130, 246, 0.9)',
              borderRadius: '4px',
              boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.75)',
            },
          }}
        />

        {/* Dynamic Head Height 70-80% Guide Lines */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: aspectRatio > 1 ? '380px' : `${380 * aspectRatio}px`,
              maxHeight: aspectRatio > 1 ? `${380 / aspectRatio}px` : '380px',
            }}
          >
            <FaceGuideOverlay preset={preset} aspectRatio={aspectRatio} />
          </div>
        </div>
      </div>

      {/* Compliance Warnings & Face Status */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w) => (
            <div
              key={w.id}
              className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                w.severity === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Adjustment Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Slider
          label={t('crop.zoom')}
          value={zoom}
          min={1}
          max={3}
          step={0.05}
          unit="x"
          onChange={setZoom}
          onReset={() => setZoom(1)}
          defaultValue={1}
        />
        <Slider
          label={t('crop.rotation')}
          value={rotation}
          min={-45}
          max={45}
          unit="°"
          onChange={setRotation}
          onReset={() => setRotation(0)}
          defaultValue={0}
        />
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
          >
            -90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            +90°
          </Button>
          <Button
            variant={flipH ? 'primary' : 'outline'}
            size="sm"
            icon={<FlipHorizontal className="w-3.5 h-3.5" />}
            onClick={() => setFlipH(!flipH)}
          >
            Flip
          </Button>
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
          onClick={handleProceed}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
