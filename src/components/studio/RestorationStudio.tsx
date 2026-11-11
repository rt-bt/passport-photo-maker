import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Maximize2,
  Clock,
  ScanFace,
  Sun,
  Layers,
  Palette,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Settings,
  Link,
  Camera,
  FileImage,
  Scissors,
  Smile,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { BeforeAfterSlider } from '../features/BeforeAfterSlider';
import { checkGpuServerHealth, restoreImageWithGpu, getGpuServerUrl, setGpuServerUrl } from '../../lib/gpuRestoration';
import { processUploadedFile } from '../../lib/exif';
import {
  GpuServerStatus,
  GpuRestoreOptions,
  GpuRestoreResult,
  ResolutionTier,
  ExportFormat,
  FacialPartControls,
  ColorizeOptions,
  SkinTonePreset,
  ClothingColorPreset,
  BackgroundColorPreset,
} from '../../types';
import {
  SKIN_TONE_PALETTES,
  CLOTHING_PALETTES,
  BACKGROUND_PALETTES,
  isImageGrayscaleOrSepia,
} from '../../lib/colorization';

interface RestorationStudioProps {
  onSendToPassportMaker: (imageSrc: string) => void;
}

export const RestorationStudio: React.FC<RestorationStudioProps> = ({
  onSendToPassportMaker,
}) => {
  const [serverStatus, setServerStatus] = useState<GpuServerStatus | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(true);

  // Active Photo
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options
  const [options, setOptions] = useState<GpuRestoreOptions>({
    upscale: 4,
    targetRes: '4k',
    faceRestore: true,
    fidelity: 0.65,
    deblock: 55,
    depthShading: 45,
    brightnessBalance: 0,
    hdrContrast: 40,
    colorWarmth: 15,
    eyeClarity: 35,
    denoise: 20,
    sharpen: 35,
    outputFormat: 'jpeg',
    facialParts: {
      irisClarity: 50,
      eyeWhiten: 40,
      eyebrowDefine: 35,
      eyeBagRemoval: 30,
      noseBridgeDefine: 35,
      noseContour: 30,
      lipVibrancy: 35,
      lipContour: 30,
      teethWhiten: 40,
      earDefine: 25,
      hairlineSharpen: 30,
      skinSmoothing: 45,
      skinGlow: 30,
      antiGlare: 30,
      jawlineSharpen: 50,
      cheekboneLift: 35,
      neckShadowLift: 35,
    },
    colorize: {
      enabled: false,
      skinTone: 'wheatish',
      clothingColor: 'navy',
      backgroundColor: 'studio_blue',
      vibrancy: 75,
      colorWarmth: 15,
      vintageDeSepia: true,
    },
  });

  const [activeRetouchTab, setActiveRetouchTab] = useState<'eyes' | 'nose' | 'lips' | 'skin' | 'jawline'>('eyes');

  const updateFacialPart = (key: keyof FacialPartControls, val: number) => {
    setOptions((prev) => ({
      ...prev,
      facialParts: {
        ...(prev.facialParts || {}),
        [key]: val,
      },
    }));
  };

  const updateColorize = <K extends keyof ColorizeOptions>(key: K, val: ColorizeOptions[K]) => {
    setOptions((prev) => ({
      ...prev,
      colorize: {
        ...(prev.colorize || {
          enabled: true,
          skinTone: 'wheatish',
          clothingColor: 'navy',
          backgroundColor: 'studio_blue',
          vibrancy: 75,
          colorWarmth: 15,
          vintageDeSepia: true,
        }),
        [key]: val,
      },
    }));
  };

  const [downloadFormat, setDownloadFormat] = useState<ExportFormat>('jpeg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [result, setResult] = useState<GpuRestoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [serverInputUrl, setServerInputUrl] = useState<string>(getGpuServerUrl());

  const handleSaveServerUrl = () => {
    setGpuServerUrl(serverInputUrl);
    setShowServerConfig(false);
    refreshServerHealth();
  };

  // Poll server health
  const refreshServerHealth = async () => {
    setIsCheckingServer(true);
    const status = await checkGpuServerHealth(undefined, true);
    setServerStatus(status);
    setIsCheckingServer(false);
  };

  useEffect(() => {
    let active = true;
    const check = async () => {
      setIsCheckingServer(true);
      const status = await checkGpuServerHealth(undefined, true);
      if (active) {
        setServerStatus(status);
        setIsCheckingServer(false);
      }
    };
    check();
    const interval = setInterval(async () => {
      const status = await checkGpuServerHealth();
      if (active) setServerStatus(status);
    }, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    setError(null);
    try {
      const processed = await processUploadedFile(file);
      setImageSrc(processed.dataUrl);
      setResult(null);

      // Check if uploaded photo is Black & White / Sepia and auto-enable colorization
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = 100;
        cvs.height = 100;
        const c = cvs.getContext('2d');
        if (c) {
          c.drawImage(img, 0, 0, 100, 100);
          if (isImageGrayscaleOrSepia(c, 100, 100)) {
            updateColorize('enabled', true);
          }
        }
      };
      img.src = processed.dataUrl;
    } catch (err: any) {
      console.error(err);
      setError('Failed to load image. Please provide a valid JPG, PNG, or WEBP photo.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const loadSamplePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 320, 400);

    // Suit
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(160, 400, 130, 150, 0, 0, Math.PI * 2);
    ctx.fill();

    // Collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(130, 270);
    ctx.lineTo(160, 320);
    ctx.lineTo(190, 270);
    ctx.fill();

    // Face
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.ellipse(160, 180, 70, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(160, 130, 75, 55, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(135, 175, 7, 0, Math.PI * 2);
    ctx.arc(185, 175, 7, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(160, 215, 20, 0.2, Math.PI - 0.2);
    ctx.stroke();

    const sampleUrl = canvas.toDataURL('image/jpeg', 0.7);
    setImageSrc(sampleUrl);
    setResult(null);
  };

  const getProgressStageName = (pct: number) => {
    if (pct < 15) return 'Initializing GPU VRAM & Neural Tensors...';
    if (pct < 35) return 'Anti-Mosaic & De-blocking Pre-Filter...';
    if (pct < 65) return 'Flagship RealESRGAN RRDB Clothes & Body Super-Resolution...';
    if (pct < 85) return 'GFPGAN Generative Facial Feature Reconstruction...';
    if (pct < 95) return '3D Anatomical Depth Shading & HDR Tone Mapping...';
    return 'Neural Processing & Master Encoding (almost done)...';
  };

  const handleRunRestoration = async () => {
    if (!imageSrc) return;
    setError(null);
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStage('Initializing GPU VRAM & Neural Tensors...');

    // Calibrate realistic progress curve based on target resolution
    const estimatedMs =
      options.targetRes === '16k' ? 18000 :
      options.targetRes === '8k'  ? 11000 :
      options.targetRes === '4k'  ? 6800 :
      options.targetRes === '2k'  ? 4200 : 2500;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let rawPct: number;
      if (elapsed <= estimatedMs) {
        rawPct = Math.round(5 + (elapsed / estimatedMs) * 85);
      } else {
        // Continuous smooth creeping progress from 90% up to 98% while waiting for large renders
        const extraTime = elapsed - estimatedMs;
        rawPct = Math.min(98, Math.round(90 + (extraTime / 12000) * 8));
      }
      setProgressPercent((prev) => Math.max(prev, rawPct));
      setProgressStage(getProgressStageName(rawPct));
    }, 50);

    try {
      const res = await restoreImageWithGpu(imageSrc, {
        ...options,
        outputFormat: downloadFormat,
      });
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
          'Failed to render on GPU server. Please ensure the local server is running.'
      );
    }
  };

  const handleDownload = (format: ExportFormat = downloadFormat) => {
    if (!result?.dataUrl) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';
    a.download = `restored-${result.targetRes.toUpperCase()}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const tiers: { id: ResolutionTier; label: string; desc: string }[] = [
    { id: 'original', label: 'Original', desc: '1× Clean' },
    { id: '2k', label: '2K QHD', desc: '2048px' },
    { id: '4k', label: '4K UHD', desc: '3840px (Pro)' },
    { id: '8k', label: '8K Ultra', desc: '7680px' },
    { id: '16k', label: '16K Master', desc: '15360px' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      {/* Hero Header & GPU Hardware Indicator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              Ultra Super-Resolution & 3D Depth Engine (2K — 16K)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Photo Restoration & Detail Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Reconstruct blurry portraits, deep facial landmarks, fabric weaves, and ambient depth shading with real-time GPU hardware acceleration.
            </p>
          </div>

          {/* GPU Hardware Status Pill */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0 text-xs space-y-1.5 min-w-[240px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Detected Hardware:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    serverStatus?.online
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isCheckingServer ? 'Checking' : serverStatus?.online ? 'Online' : 'Offline'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setServerInputUrl(getGpuServerUrl());
                    setShowServerConfig((prev) => !prev);
                  }}
                  title="Configure AI Server Endpoint (Local or Cloud URL)"
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                </button>
                {!serverStatus?.online && (
                  <button
                    type="button"
                    onClick={refreshServerHealth}
                    title="Retry connection to local GPU server"
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingServer ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>
            <div className="font-bold text-white flex items-center gap-1.5 truncate">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">{serverStatus?.gpuName || 'System Hardware'}</span>
            </div>
            {serverStatus?.online && (
              <div className="text-[11px] text-slate-300 flex items-center justify-between">
                <span>Profile: {serverStatus.performanceProfile || 'Adaptive'}</span>
                <span>
                  {serverStatus.vramFreeMb ? `${Math.round(serverStatus.vramFreeMb / 1024)}GB Free` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud / Local Server Endpoint Configuration Panel */}
      {showServerConfig && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-indigo-900/80 text-white text-xs space-y-3 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-indigo-300">
              <Settings className="w-4 h-4 text-indigo-400" /> AI Server Endpoint Configuration
            </span>
            <button
              type="button"
              onClick={() => setShowServerConfig(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-slate-300 text-xs">
            Enter the URL of your AI GPU Backend (Default: <code className="text-indigo-300">http://127.0.0.1:8000</code>). When deployed on Vercel, connect your public cloud GPU API (e.g. Hugging Face Spaces, RunPod, Modal, or ngrok tunnel):
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={serverInputUrl}
              onChange={(e) => setServerInputUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000 or https://your-space.hf.space"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={handleSaveServerUrl}>
                Save & Connect
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setServerInputUrl('http://127.0.0.1:8000');
                  setGpuServerUrl('http://127.0.0.1:8000');
                  refreshServerHealth();
                }}
                className="text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                Reset Default
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Engine Status Callout */}
      {typeof window !== 'undefined' && window.location.protocol === 'https:' && !serverStatus?.serverConnected ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs sm:text-sm shadow-md animate-in fade-in space-y-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                ⚠️ Vercel HTTPS Browser Restriction (Mixed Content)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Vercel <strong>HTTPS</strong> par chalta hai, isliye browser aapke computer ke local Python server (<code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">http://127.0.0.1:8000</code>) ko security ke kaaran <strong>block</strong> kar deta hai. Is wajah se GFPGAN AI neural face restoration Vercel se local server tak nahi pahunch pa raha.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <a
                  href="http://localhost:5173"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  Open on http://localhost:5173 (Full RTX 4080 Speed)
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowServerConfig(true)}
                  className="text-xs border-amber-400 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Connect HTTPS Tunnel / Cloud URL
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : !serverStatus?.serverConnected ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-indigo-900 dark:text-indigo-200 flex flex-wrap items-center gap-1.5">
                <span>In-Browser GPU Acceleration Active</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-750">
                  {serverStatus?.gpuName || 'System Hardware'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Full 2K–16K super-resolution, anti-pixelation, and 3D depth shading rendered directly on your system's GPU inside the browser.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowServerConfig(true)}
              className="text-xs text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100/50"
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              PyTorch Server (Optional)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshServerHealth}
              title="Check if local or cloud PyTorch server is active"
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingServer ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Dedicated PyTorch CUDA Server Connected:</strong> {serverStatus.gpuName} ({serverStatus.performanceProfile})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowServerConfig(true)}
            className="text-[11px] text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
          >
            Server Settings
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Canvas & Interactive Before/After Inspection */}
        <div className="lg:col-span-8 space-y-5">
          {imageSrc ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              {/* Canvas Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    {result ? 'Inspection Canvas' : 'Input Image'}
                  </span>
                  {result && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      {result.targetRes.toUpperCase()} Restored
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload Different Photo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={loadSamplePhoto}>
                    Sample
                  </Button>
                </div>
              </div>

              {/* Viewport: Before/After Slider or Raw Image */}
              <div className="flex justify-center relative">
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-white z-20 space-y-4 animate-in fade-in">
                    <div className="relative flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      <span className="absolute text-2xl font-black font-mono text-white">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="text-center space-y-1.5 max-w-sm">
                      <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                        {progressStage}
                      </div>
                      <p className="text-xs text-slate-300">
                        Universal GPU Engine &bull; {options.targetRes.toUpperCase()} Studio Render
                      </p>
                    </div>
                  </div>
                )}

                {result ? (
                  <div className="w-full">
                    <BeforeAfterSlider
                      beforeUrl={imageSrc}
                      afterUrl={result.dataUrl}
                      aspectRatio={4 / 5}
                    />
                  </div>
                ) : (
                  <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt="Input photo"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 text-[10px] font-bold text-white tracking-wider">
                      ORIGINAL PREVIEW
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              {result && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500">Original Resolution</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {result.originalWidth} × {result.originalHeight} px
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    <div className="text-indigo-600 dark:text-indigo-400">Restored Resolution</div>
                    <div className="font-bold text-indigo-700 dark:text-indigo-200 text-sm mt-0.5">
                      {result.enhancedWidth} × {result.enhancedHeight} px
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500">Faces Reconstructed</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 flex items-center gap-1">
                      <ScanFace className="w-4 h-4 text-indigo-500" />
                      {result.facesDetected > 0 ? `${result.facesDetected} Face(s)` : 'Whole Photo'}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <div className="text-emerald-600 dark:text-emerald-400">Render Latency</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-200 text-sm mt-0.5 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {result.processingTimeMs} ms
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Dropzone Hero */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 rounded-3xl p-12 text-center cursor-pointer bg-white dark:bg-slate-900 transition-all shadow-sm group space-y-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                <Upload className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Drag & Drop Any Photo to Restore in Ultra-HD
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Supports portrait photos, blurry family images, old scans, or low-resolution shots. We will restore faces, clothes, depth, and upscale up to 16K.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                >
                  <FileImage className="w-4 h-4 mr-1.5" />
                  Browse Photo from Device
                </Button>
                <Button variant="outline" size="md" onClick={loadSamplePhoto}>
                  <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
                  Try Test Portrait
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Studio Controls & Ultra-Res Exporters */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Resolution Tier Selector */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                Target Resolution Tier
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Up to 16K Master
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOptions((o) => ({ ...o, targetRes: t.id }))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                    options.targetRes === t.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{t.label}</div>
                    <div className="text-[10px] text-slate-500">{t.desc}</div>
                  </div>
                  {options.targetRes === t.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. AI Black & White to Full Color Photo Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-500" />
                Black & White to Color Photo
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.colorize?.enabled ?? false}
                  onChange={(e) => updateColorize('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {options.colorize?.enabled ? (
              <div className="space-y-4 animate-in fade-in">
                {/* 1. Skin Tone Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Skin Tone Palette:</span>
                    <span className="text-purple-600 dark:text-purple-400 capitalize">
                      {options.colorize.skinTone || 'wheatish'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['wheatish', 'fair', 'medium', 'olive', 'deep'] as SkinTonePreset[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateColorize('skinTone', st)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          (options.colorize?.skinTone || 'wheatish') === st
                            ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                          style={{
                            backgroundColor: `rgb(${SKIN_TONE_PALETTES[st].r}, ${SKIN_TONE_PALETTES[st].g}, ${SKIN_TONE_PALETTES[st].b})`,
                          }}
                        />
                        <span className="text-[10px] font-medium capitalize truncate w-full">
                          {st}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Clothing Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Clothing / Suit Color:</span>
                    <span className="text-purple-600 dark:text-purple-400 capitalize">
                      {(options.colorize.clothingColor || 'navy').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {(['navy', 'black', 'charcoal', 'royal_blue', 'maroon', 'forest_green'] as ClothingColorPreset[]).map((cc) => (
                      <button
                        key={cc}
                        type="button"
                        onClick={() => updateColorize('clothingColor', cc)}
                        title={cc.replace('_', ' ')}
                        className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          (options.colorize?.clothingColor || 'navy') === cc
                            ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{
                            backgroundColor: `rgb(${CLOTHING_PALETTES[cc].r}, ${CLOTHING_PALETTES[cc].g}, ${CLOTHING_PALETTES[cc].b})`,
                          }}
                        />
                        <span className="text-[8.5px] font-medium capitalize truncate w-full">
                          {cc.split('_')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Background Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Background Tone:</span>
                    <span className="text-purple-600 dark:text-purple-400 capitalize">
                      {(options.colorize.backgroundColor || 'studio_blue').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['studio_blue', 'passport_blue', 'light_gray', 'off_white'] as BackgroundColorPreset[]).map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => updateColorize('backgroundColor', bg)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          (options.colorize?.backgroundColor || 'studio_blue') === bg
                            ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                          style={{
                            backgroundColor: `rgb(${BACKGROUND_PALETTES[bg].r}, ${BACKGROUND_PALETTES[bg].g}, ${BACKGROUND_PALETTES[bg].b})`,
                          }}
                        />
                        <span className="text-[10px] font-medium capitalize truncate w-full">
                          {bg.split('_')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Color Vibrancy & Warmth Sliders */}
                <Slider
                  label="Color Saturation & Vibrancy"
                  value={options.colorize.vibrancy ?? 75}
                  min={20}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateColorize('vibrancy', v)}
                />

                <Slider
                  label="Color Temperature / Warmth"
                  value={options.colorize.colorWarmth ?? 15}
                  min={-40}
                  max={40}
                  step={5}
                  onChange={(v) => updateColorize('colorWarmth', v)}
                />

                {/* 5. Vintage De-Sepia check */}
                <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.colorize.vintageDeSepia ?? true}
                    onChange={(e) => updateColorize('vintageDeSepia', e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-purple-600 cursor-pointer"
                  />
                  <span>Remove vintage yellow/sepia aging stains</span>
                </label>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turn on to automatically convert black & white, grayscale, or old sepia photos into lifelike full color portraits with realistic skin, eyes, and clothing tones.
              </p>
            )}
          </div>

          {/* 3. Deep Shading & Lighting Studio Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Deep Shading & Lighting Studio
              </span>
              <span className="text-[10px] text-slate-400">3D Contours</span>
            </div>

            {/* Depth Shading & 3D Contour */}
            <Slider
              label="3D Depth Shading & Contour"
              value={options.depthShading}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setOptions((o) => ({ ...o, depthShading: v }))}
            />

            {/* Exposure / Brightness Balance */}
            <Slider
              label="Exposure & Highlight Recovery"
              value={options.brightnessBalance}
              min={-50}
              max={50}
              step={5}
              onChange={(v) => setOptions((o) => ({ ...o, brightnessBalance: v }))}
            />

            {/* HDR Micro-Contrast */}
            <Slider
              label="HDR Micro-Contrast & Fabric Pop"
              value={options.hdrContrast}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setOptions((o) => ({ ...o, hdrContrast: v }))}
            />

            {/* Skin Warmth & Radiance */}
            <Slider
              label="Skin Tone Warmth & Radiance"
              value={options.colorWarmth}
              min={-50}
              max={50}
              step={5}
              onChange={(v) => setOptions((o) => ({ ...o, colorWarmth: v }))}
            />

            {/* Eye Clarity & Iris Pop */}
            <Slider
              label="Eye Clarity & Iris Pop"
              value={options.eyeClarity}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setOptions((o) => ({ ...o, eyeClarity: v }))}
            />
          </div>

          {/* 3. Deep Facial & Cleanliness Controls */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ScanFace className="w-3.5 h-3.5 text-indigo-500" />
                Facial AI & Polish
              </span>
              <input
                type="checkbox"
                checked={options.faceRestore}
                onChange={(e) => setOptions((o) => ({ ...o, faceRestore: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
            </div>

            {options.faceRestore && (
              <Slider
                label="Identity Resemblance vs AI Sharpen"
                value={Math.round(options.fidelity * 100)}
                min={20}
                max={90}
                step={5}
                unit="%"
                onChange={(v) => setOptions((o) => ({ ...o, fidelity: v / 100 }))}
              />
            )}

            <Slider
              label="Anti-Pixelation & De-Blocking (Mosaic Cleanup)"
              value={options.deblock ?? 40}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setOptions((o) => ({ ...o, deblock: v }))}
            />

            <Slider
              label="Noise & Grain Cleanup"
              value={options.denoise}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setOptions((o) => ({ ...o, denoise: v }))}
            />

            <Slider
              label="Studio Edge Sharpness"
              value={options.sharpen}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setOptions((o) => ({ ...o, sharpen: v }))}
            />
          </div>

          {/* 4. Manual Facial Sculptor & Retouch Suite (Part-by-Part Precision) */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-indigo-500" />
                Manual Facial Retouch & Face Cutting
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Precision Landmarks
              </span>
            </div>

            {/* Facial Part Tab Buttons */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveRetouchTab('eyes')}
                className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeRetouchTab === 'eyes'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Eyes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRetouchTab('nose')}
                className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeRetouchTab === 'nose'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Nose</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRetouchTab('lips')}
                className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeRetouchTab === 'lips'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Lips</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRetouchTab('skin')}
                className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeRetouchTab === 'skin'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Skin</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRetouchTab('jawline')}
                className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeRetouchTab === 'jawline'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Jawline</span>
              </button>
            </div>

            {/* Tab 1: Eyes */}
            {activeRetouchTab === 'eyes' && (
              <div className="space-y-3.5 pt-1 animate-in fade-in">
                <Slider
                  label="Iris Clarity & Pupil Depth"
                  value={options.facialParts?.irisClarity ?? 50}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('irisClarity', v)}
                />
                <Slider
                  label="Sclera Whitening (Eye White Clean)"
                  value={options.facialParts?.eyeWhiten ?? 40}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('eyeWhiten', v)}
                />
                <Slider
                  label="Eyebrow & Lash Definition"
                  value={options.facialParts?.eyebrowDefine ?? 35}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('eyebrowDefine', v)}
                />
                <Slider
                  label="Under-Eye Dark Circle Eraser"
                  value={options.facialParts?.eyeBagRemoval ?? 30}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('eyeBagRemoval', v)}
                />
              </div>
            )}

            {/* Tab 2: Nose */}
            {activeRetouchTab === 'nose' && (
              <div className="space-y-3.5 pt-1 animate-in fade-in">
                <Slider
                  label="Nose Bridge Highlight & Straightening"
                  value={options.facialParts?.noseBridgeDefine ?? 35}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('noseBridgeDefine', v)}
                />
                <Slider
                  label="3D Nose Slimming & Lateral Contours"
                  value={options.facialParts?.noseContour ?? 30}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('noseContour', v)}
                />
              </div>
            )}

            {/* Tab 3: Lips & Teeth */}
            {activeRetouchTab === 'lips' && (
              <div className="space-y-3.5 pt-1 animate-in fade-in">
                <Slider
                  label="Lip Natural Pink Tone & Vibrancy"
                  value={options.facialParts?.lipVibrancy ?? 35}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('lipVibrancy', v)}
                />
                <Slider
                  label="Lip Border & Cupid's Bow Outline"
                  value={options.facialParts?.lipContour ?? 30}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('lipContour', v)}
                />
                <Slider
                  label="Teeth Whitening & Stain Removal"
                  value={options.facialParts?.teethWhiten ?? 40}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('teethWhiten', v)}
                />
              </div>
            )}

            {/* Tab 4: Skin Texture & Pores */}
            {activeRetouchTab === 'skin' && (
              <div className="space-y-3.5 pt-1 animate-in fade-in">
                <Slider
                  label="Pore & Blemish Smoothing (Retains Texture)"
                  value={options.facialParts?.skinSmoothing ?? 45}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('skinSmoothing', v)}
                />
                <Slider
                  label="Melanin Glow & Skin Warmth"
                  value={options.facialParts?.skinGlow ?? 30}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('skinGlow', v)}
                />
                <Slider
                  label="Anti-Glare & Matte Oil Reduction"
                  value={options.facialParts?.antiGlare ?? 30}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('antiGlare', v)}
                />
              </div>
            )}

            {/* Tab 5: Jawline & Face Cutting */}
            {activeRetouchTab === 'jawline' && (
              <div className="space-y-3.5 pt-1 animate-in fade-in">
                <Slider
                  label="Jawline Chiseled Cutting & Sharpening"
                  value={options.facialParts?.jawlineSharpen ?? 50}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('jawlineSharpen', v)}
                />
                <Slider
                  label="Cheekbone Lift & 3D Shading"
                  value={options.facialParts?.cheekboneLift ?? 35}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('cheekboneLift', v)}
                />
                <Slider
                  label="Double Chin / Neck Shadow Lift"
                  value={options.facialParts?.neckShadowLift ?? 35}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('neckShadowLift', v)}
                />
                <Slider
                  label="Ear Contour & Hairline Crispness"
                  value={options.facialParts?.earDefine ?? 25}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => updateFacialPart('earDefine', v)}
                />
              </div>
            )}
          </div>

          {/* 5. Action Buttons & Export */}
          <div className="space-y-3">
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
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-150 relative overflow-hidden shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Hardware: {serverStatus?.gpuName || 'System GPU'}</span>
                  <span>Target: {options.targetRes.toUpperCase()}</span>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25"
              disabled={isProcessing || !imageSrc || !serverStatus?.online}
              onClick={handleRunRestoration}
            >
              {isProcessing ? (
                <>
                  <Zap className="w-5 h-5 animate-spin text-amber-300" />
                  Rendering {options.targetRes.toUpperCase()}... {progressPercent}%
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                  Render & Restore in {options.targetRes.toUpperCase()}
                </>
              )}
            </Button>

            {/* Download Options when result exists */}
            {result && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {result.targetRes.toUpperCase()} Render Ready!
                  </span>
                  <span>{result.enhancedWidth} × {result.enhancedHeight}</span>
                </div>

                {/* Format selection */}
                <div className="grid grid-cols-3 gap-2">
                  {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setDownloadFormat(fmt)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        downloadFormat === fmt
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-emerald-500/20"
                    onClick={() => handleDownload(downloadFormat)}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download {downloadFormat.toUpperCase()}
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                    onClick={() => onSendToPassportMaker(result.dataUrl)}
                    title="Transfer this restored high-res photo into Passport Size Photo Maker"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    To Passport Maker
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
