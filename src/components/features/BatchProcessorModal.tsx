import React, { useState } from 'react';
import { Upload, Download, Sparkles, Check, Trash2, Loader2, FolderArchive } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PassportPreset } from '../../types';
import { mmToPx } from '../../lib/units';
import { processUploadedFile } from '../../lib/exif';

interface BatchProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: PassportPreset;
}

interface BatchItem {
  id: string;
  name: string;
  dataUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
}

export const BatchProcessorModal: React.FC<BatchProcessorModalProps> = ({
  isOpen,
  onClose,
  preset,
}) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const processed = await processUploadedFile(file);
        newItems.push({
          id: Math.random().toString(36).substring(7),
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl: processed.dataUrl,
          status: 'pending',
        });
      } catch (err) {
        console.error('Error loading file for batch:', err);
      }
    }
    setItems((prev) => [...prev, ...newItems]);
  };

  const processAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const targetWidth = mmToPx(preset.widthMm, 300);
    const targetHeight = mmToPx(preset.heightMm, 300);

    const zip = new JSZip();
    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      setProgressText(`Processing ${i + 1} of ${updated.length}: ${item.name}`);
      item.status = 'processing';
      setItems([...updated]);

      try {
        // Load image into canvas and crop to center aspect ratio
        const blob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas unavailable'));

            // Center crop
            const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (targetWidth - w) / 2;
            const y = (targetHeight - h) / 2;

            ctx.drawImage(img, x, y, w, h);
            canvas.toBlob(
              (b) => {
                if (b) resolve(b);
                else reject(new Error('Blob failed'));
              },
              'image/jpeg',
              0.92
            );
          };
          img.onerror = reject;
          img.src = item.dataUrl;
        });

        item.processedBlob = blob;
        item.status = 'done';
        zip.file(`${item.name}-${preset.widthMm}x${preset.heightMm}mm.jpg`, blob);
      } catch (err) {
        item.status = 'error';
      }
      setItems([...updated]);
    }

    setProgressText('Packaging ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `passport-photos-${preset.id}-batch.zip`);

    setIsProcessing(false);
    setProgressText('Completed!');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Photo Processor" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload multiple photos at once. They will all be automatically cropped to{' '}
          <strong>{preset.name} ({preset.widthMm}×{preset.heightMm} mm)</strong> at 300 DPI and bundled into a ZIP file.
        </p>

        {/* Upload Drop Area */}
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Choose Multiple Photos (or drag & drop)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            PNG, JPG, WEBP, HEIC
          </span>
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={handleFiles}
            className="hidden"
          />
        </label>

        {/* Items List */}
        {items.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={item.dataUrl}
                    alt={item.name}
                    className="w-8 h-8 rounded-md object-cover border border-slate-200"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      item.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-mono">
            {progressText || `${items.length} photo(s) selected`}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isProcessing}
              disabled={items.length === 0}
              icon={<FolderArchive className="w-4 h-4" />}
              onClick={processAll}
            >
              Process & Download ZIP
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
