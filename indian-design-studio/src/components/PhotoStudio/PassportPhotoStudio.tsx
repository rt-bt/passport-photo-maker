'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Download,
  Printer,
  Sliders,
  Crop,
  Layers,
  Sparkles,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { generatePassportPhotoSheet } from '@/lib/exportUtils';
import jsPDF from 'jspdf';

export default function PassportPhotoStudio() {
  const [photoSrc, setPhotoSrc] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );

  // Dimension preset
  const [preset, setPreset] = useState<'passport-in' | 'visa-in' | 'stamp' | 'pan'>('passport-in');

  // Background replacement color
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Image adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // Multi-print sheet count
  const [sheetCount, setSheetCount] = useState<8 | 16 | 32>(16);
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presets = [
    {
      id: 'passport-in',
      name: 'Indian Passport',
      size: '35mm × 45mm',
      aspect: '35/45',
      desc: 'Official standard for Indian Passport renewal and police verification',
    },
    {
      id: 'visa-in',
      name: 'Indian / US Visa',
      size: '51mm × 51mm (2" × 2")',
      aspect: '1/1',
      desc: 'Required for Overseas Visa, OCI card, and international travel',
    },
    {
      id: 'stamp',
      name: 'Stamp Size',
      size: '25mm × 30mm',
      aspect: '25/30',
      desc: 'Admit cards, college exam forms, and application files',
    },
    {
      id: 'pan',
      name: 'PAN Card / Govt Exam',
      size: '25mm × 35mm',
      aspect: '25/35',
      desc: 'NSDL / UTI PAN application & SSC/UPSC registration',
    },
  ];

  // Handle image upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setPhotoSrc(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Download Single Cropped Photo
  const handleDownloadSinglePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 413; // 35mm at 300 DPI
    canvas.height = 531; // 45mm at 300 DPI
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Filter
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Indian_Passport_Photo_35x45mm.jpg`;
      link.click();
    };
    img.src = photoSrc;
  };

  // Download A4 Multi-photo Print Sheet
  const handleDownloadSheet = async () => {
    setIsExporting(true);
    try {
      // First render single composite photo
      const canvas = document.createElement('canvas');
      canvas.width = 413;
      canvas.height = 531;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const singlePhotoDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        await generatePassportPhotoSheet(singlePhotoDataUrl, sheetCount);
        setIsExporting(false);
      };
      img.src = photoSrc;
    } catch (e) {
      console.error(e);
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
          <Camera className="w-3.5 h-3.5" />
          Passport & Visa Photo Studio
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Indian Passport Photo Maker & A4 Sheet Multi-Print
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Crop to official 35mm x 45mm specifications, replace background color with studio light blue or white, and generate print-ready sheets for 4x6" or A4 photo paper.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CONTROLS (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              1. Select Photo Size Requirement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((p) => {
                const isSel = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSel
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{p.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {p.size}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Replacement Color */}
          <div className="border-t border-slate-100 pt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              2. Studio Background Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { name: 'Pure White (Govt Standard)', hex: '#ffffff' },
                { name: 'Studio Light Blue', hex: '#bae6fd' },
                { name: 'Soft Gray', hex: '#e2e8f0' },
                { name: 'Off-White / Cream', hex: '#fefce8' },
                { name: 'Deep Royal Blue', hex: '#1e3a8a' },
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setBgColor(c.hex)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                    bgColor === c.hex
                      ? 'border-emerald-600 bg-slate-50 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Studio Enhancements */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Studio Image Enhancement
              </label>
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                }}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="140"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Color Balance</span>
                  <span>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Multi-print Sheet Selection */}
          <div className="border-t border-slate-100 pt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              4. A4 Sheet Multi-Print Quantity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 8, label: '8 Photos (4x6" Sheet)' },
                { count: 16, label: '16 Photos (A4 Half Sheet)' },
                { count: 32, label: '32 Photos (Full A4 Sheet)' },
              ].map((s) => (
                <button
                  key={s.count}
                  onClick={() => setSheetCount(s.count as any)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    sheetCount === s.count
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-extrabold">{s.count} Photos</span>
                  <span className="text-[10px] text-slate-500">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <label className="py-3 px-4 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              Upload New Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleDownloadSinglePhoto}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Single 35x45mm Photo
            </button>
            <button
              onClick={handleDownloadSheet}
              disabled={isExporting}
              className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-98"
            >
              <Printer className="w-4 h-4" />
              {isExporting ? 'Generating PDF...' : `Print ${sheetCount} Photos on A4 Sheet`}
            </button>
          </div>
        </div>

        {/* PHOTO PREVIEW (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Face Alignment & Print Preview</span>
            <button
              onClick={() => setShowFaceGuide(!showFaceGuide)}
              className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
            >
              {showFaceGuide ? 'Hide Face Frame' : 'Show Face Frame'}
            </button>
          </div>

          {/* Passport Photo Box with Face Alignment Guide */}
          <div
            className="w-full aspect-[35/45] rounded-2xl border-4 border-slate-300 shadow-2xl relative overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <img
              src={photoSrc}
              alt="Passport Photo"
              className="w-full h-full object-cover transition-all"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
              }}
            />

            {/* Indian Passport Face Framing Guide Overlay (70-80% face area requirement) */}
            {showFaceGuide && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Oval face guide */}
                <div className="w-[62%] h-[68%] rounded-[50%] border-2 border-dashed border-emerald-400 shadow-xs flex items-center justify-center relative">
                  <div className="w-12 h-0.5 bg-emerald-400/80 absolute top-1/3" />
                  <span className="text-[9px] font-bold text-emerald-400 absolute top-2 bg-black/60 px-1.5 py-0.5 rounded">
                    Crown & Eyes
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 absolute bottom-2 bg-black/60 px-1.5 py-0.5 rounded">
                    Chin Line
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Official Specs Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Info className="w-4 h-4 text-blue-600" />
              Passport Seva Official Photo Guidelines:
            </div>
            <ul className="text-[11px] list-disc list-inside space-y-0.5 text-slate-500">
              <li>Dimensions: 35mm x 45mm (approx 1.37 x 1.77 inches).</li>
              <li>Face must cover 70% to 80% of the photograph.</li>
              <li>Neutral facial expression with both ears visible and eyes open.</li>
              <li>Clean, plain white or very light blue background without shadows.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
