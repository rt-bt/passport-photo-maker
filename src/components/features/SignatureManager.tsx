import React, { useState, useRef } from 'react';
import { PenTool, Upload, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Slider } from '../common/Slider';
import { processSignature } from '../../lib/signature';
import { SignatureSettings } from '../../types';

interface SignatureManagerProps {
  settings: SignatureSettings;
  onChange: (settings: SignatureSettings) => void;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({
  settings,
  onChange,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const transparentDataUrl = await processSignature(
        file,
        settings.threshold,
        settings.widthMm,
        settings.heightMm
      );
      onChange({
        ...settings,
        enabled: true,
        dataUrl: transparentDataUrl,
      });
    } catch (err) {
      console.error('Failed to process signature:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdChange = async (newThreshold: number) => {
    if (!settings.dataUrl) return;
    onChange({ ...settings, threshold: newThreshold });
  };

  const handleDownload = () => {
    if (!settings.dataUrl) return;
    const a = document.createElement('a');
    a.href = settings.dataUrl;
    a.download = `signature-${settings.widthMm}x${settings.heightMm}mm.png`;
    a.click();
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          <span>Signature Tool (Transparent Paper-Removed PNG)</span>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!settings.dataUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload photo or scan of signature
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Paper background will be automatically removed into transparent ink strokes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview with checkerboard background */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] dark:bg-slate-900">
                <img
                  src={settings.dataUrl}
                  alt="Transparent signature"
                  className="max-h-20 object-contain shadow-xs"
                />
              </div>

              {/* Threshold adjustment */}
              <Slider
                label="Ink Contrast Threshold"
                value={settings.threshold}
                min={100}
                max={245}
                onChange={handleThresholdChange}
              />

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => onChange({ ...settings, dataUrl: null })}
                >
                  Remove
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={handleDownload}
                  >
                    Download Signature ({settings.widthMm}×{settings.heightMm}mm)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
