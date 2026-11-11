import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Maximize2,
  Clock,
  ScanFace,
  Terminal,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import {
  checkGpuServerHealth,
  restoreImageWithGpu,
} from '../../lib/gpuRestoration';
import { processUploadedFile } from '../../lib/exif';
import { GpuServerStatus, GpuRestoreOptions, GpuRestoreResult } from '../../types';

interface GpuRestorationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputImage: string | null;
  onApplyRestoredImage: (restoredDataUrl: string) => void;
}

export const GpuRestorationModal: React.FC<GpuRestorationModalProps> = ({
  isOpen,
  onClose,
  inputImage,
  onApplyRestoredImage,
}) => {
  const [serverStatus, setServerStatus] = useState<GpuServerStatus | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(true);

  // Active image being restored (can be inputImage or freshly uploaded inside the modal)
  const [activeImage, setActiveImage] = useState<string | null>(inputImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [options, setOptions] = useState<GpuRestoreOptions>({
    upscale: 4,
    targetRes: '4k',
    faceRestore: true,
    fidelity: 0.65,
    deblock: 55,
    depthShading: 30,
    brightnessBalance: 0,
    hdrContrast: 30,
    colorWarmth: 10,
    eyeClarity: 30,
    denoise: 20,
    sharpen: 35,
    outputFormat: 'jpeg',
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [result, setResult] = useState<GpuRestoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync activeImage whenever inputImage changes
  useEffect(() => {
    setActiveImage(inputImage);
    setResult(null);
    setError(null);
  }, [inputImage, isOpen]);

  // Check GPU server status when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const check = async () => {
      setIsCheckingServer(true);
      const status = await checkGpuServerHealth(undefined, true);
      if (isMounted) {
        setServerStatus(status);
        setIsCheckingServer(false);
      }
    };
    check();

    const interval = setInterval(async () => {
      const status = await checkGpuServerHealth(undefined, true);
      if (isMounted) {
        setServerStatus(status);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  const handleFileUpload = async (file: File) => {
    setError(null);
    try {
      const processed = await processUploadedFile(file);
      setActiveImage(processed.dataUrl);
      setResult(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load image. Please try a valid JPG, PNG, or WEBP file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getProgressStageName = (pct: number) => {
    if (pct < 15) return 'Initializing GPU VRAM & Neural Tensors...';
    if (pct < 35) return 'Anti-Mosaic & De-blocking Pre-Filter...';
    if (pct < 65) return 'RealESRGAN RRDB Clothes & Body Super-Resolution...';
    if (pct < 85) return 'GFPGAN Generative Facial Feature Reconstruction...';
    if (pct < 95) return '3D Anatomical Depth Shading & HDR Tone Mapping...';
    return 'Neural Processing & Master Encoding (almost done)...';
  };

  const handleRunRestoration = async () => {
    if (!activeImage) return;
    setError(null);
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStage('Initializing GPU VRAM & Neural Tensors...');

    const estimatedMs = options.upscale === 4 ? 6000 : 3500;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let rawPct: number;
      if (elapsed <= estimatedMs) {
        rawPct = Math.round(5 + (elapsed / estimatedMs) * 85);
      } else {
        const extraTime = elapsed - estimatedMs;
        rawPct = Math.min(98, Math.round(90 + (extraTime / 10000) * 8));
      }
      setProgressPercent((prev) => Math.max(prev, rawPct));
      setProgressStage(getProgressStageName(rawPct));
    }, 50);

    try {
      const res = await restoreImageWithGpu(activeImage, options);
      clearInterval(interval);
      setProgressPercent(100);
      setProgressStage('✅ Render Complete (100%)');
      setResult(res);
      setTimeout(() => {
        setIsProcessing(false);
      }, 350);
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setProgressPercent(0);
      setProgressStage('');
      console.error(err);
      setError(
        err.message ||
          'Failed to connect to GPU server. Please ensure the local server is running.'
      );
    }
  };

  const handleApply = () => {
    if (result?.dataUrl) {
      onApplyRestoredImage(result.dataUrl);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Full-Photo Restoration & Super-Resolution"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        {/* GPU Status Banner */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            serverStatus?.online
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                  serverStatus?.online
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
                    : 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-500/20'
                }`}
              >
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">
                    {serverStatus?.online
                      ? `${serverStatus.gpuName || 'Hardware Acceleration Active'}`
                      : 'Local AI Engine Offline'}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      serverStatus?.online
                        ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    {isCheckingServer ? 'Checking...' : serverStatus?.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5">
                  {serverStatus?.online
                    ? `Auto-Configured: ${serverStatus.performanceProfile || 'Adaptive GPU Mode'} — Full Photo (Face + Clothes + Background) Neural Restoration`
                    : 'Start the Python GPU engine to unleash genuine AI neural restoration'}
                </p>
              </div>
            </div>

            <button
              onClick={() => checkGpuServerHealth(undefined, true).then(setServerStatus)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {!serverStatus?.online && !isCheckingServer && (
            <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/60 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-950 dark:text-amber-200">
                <Terminal className="w-3.5 h-3.5" />
                How to start the GPU server:
              </div>
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                Double click{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold">
                  server\run_server.bat
                </code>{' '}
                in your project directory.
              </p>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo Upload & Inspection Section */}
        <div className="space-y-3">
          {activeImage ? (
            <div className="flex flex-col items-center">
              {/* Image Toolbar */}
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {result
                    ? 'Drag slider to compare Before & After GPU Restoration'
                    : 'Low-Quality Photo Loaded'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm cursor-pointer text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Upload Different Photo
                </button>
              </div>

              {result ? (
                <div className="w-full">
                  <div className="flex items-center justify-end mb-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {result.processingTimeMs} ms
                    </span>
                  </div>
                  <BeforeAfterSlider
                    beforeUrl={activeImage}
                    afterUrl={result.dataUrl}
                    aspectRatio={35 / 45}
                  />

                  {/* Stats Bar */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400">Original</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {result.originalWidth} × {result.originalHeight} px
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400">Faces Restored</div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                        <ScanFace className="w-3.5 h-3.5" />
                        {result.facesDetected > 0 ? `${result.facesDetected} Face(s)` : 'Enhanced'}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-emerald-600 dark:text-emerald-400">Restored UHD</div>
                      <div className="font-bold text-emerald-700 dark:text-emerald-300">
                        {result.enhancedWidth} × {result.enhancedHeight} px
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-xs aspect-[35/45] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-white space-y-3 animate-in fade-in">
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <span className="absolute text-lg font-black font-mono text-white">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          {progressStage}
                        </div>
                        <p className="text-[10px] text-slate-300">
                          {serverStatus?.gpuName || 'System GPU'}
                        </p>
                      </div>
                    </div>
                  )}
                  <img
                    src={activeImage}
                    alt="Current photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-semibold text-white tracking-wider">
                    ORIGINAL INPUT PHOTO
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Direct Dropzone inside the Modal */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 rounded-3xl p-10 text-center cursor-pointer bg-indigo-50/40 dark:bg-indigo-950/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or Drag & Drop Any Low-Quality Photo Here
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Upload your blurry, old, or WhatsApp compressed portrait to restore it with GFPGAN & RTX 4080 CUDA.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="w-4 h-4 mr-1.5" />
                Browse Photo from Device
              </Button>
            </div>
          )}
        </div>

        {/* AI Restoration Controls */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Restoration Parameters
            </span>
            <span className="text-xs text-slate-500">GFPGAN v1.4 CUDA</span>
          </div>

          {/* Upscale factor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Super-Resolution Upscaling Factor
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOptions((o) => ({ ...o, upscale: 2 }))}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  options.upscale === 2
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                2× High Definition
              </button>
              <button
                type="button"
                onClick={() => setOptions((o) => ({ ...o, upscale: 4 }))}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  options.upscale === 4
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                4× Ultra HD (Passport Studio Detail)
              </button>
            </div>
          </div>

          {/* Face Restoration Toggle & Fidelity */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ScanFace className="w-3.5 h-3.5 text-indigo-500" />
                  GFPGAN Deep Generative Facial Restoration
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reconstructs eyes, irises, pupils, eyebrows, teeth, lips & realistic skin texture
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.faceRestore}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, faceRestore: e.target.checked }))
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {options.faceRestore && (
              <Slider
                label="Original Face Resemblance vs Sharpening Strength"
                value={Math.round(options.fidelity * 100)}
                min={20}
                max={90}
                step={5}
                unit="%"
                onChange={(val) =>
                  setOptions((o) => ({ ...o, fidelity: val / 100 }))
                }
              />
            )}
          </div>

          {/* Denoise & Sharpen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Slider
              label="Noise Reduction"
              value={options.denoise}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => setOptions((o) => ({ ...o, denoise: val }))}
            />
            <Slider
              label="Detail Sharpening"
              value={options.sharpen}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => setOptions((o) => ({ ...o, sharpen: val }))}
            />
          </div>
        </div>

        {/* Progress Bar & Percentage Indicator */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/60 dark:to-blue-950/60 border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 truncate">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce shrink-0" />
                <span className="truncate">{progressStage}</span>
              </span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono ml-2">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-150 relative overflow-hidden shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>GPU: {serverStatus?.gpuName || 'System GPU'}</span>
              <span>Quality: {options.upscale}× Super-Resolution</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {result ? (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={handleRunRestoration}
                disabled={isProcessing || !serverStatus?.online}
              >
                <RotateCcw className="w-4 h-4" />
                Re-render with New Settings
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleApply}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply High-Res Restored Photo
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleRunRestoration}
                disabled={isProcessing || !serverStatus?.online || !activeImage}
                className="shadow-blue-500/25 bg-indigo-600 hover:bg-indigo-700"
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-amber-300" />
                    Restoring {progressPercent}%
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    Restore Full Photo (Face + Clothes + Background)
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
