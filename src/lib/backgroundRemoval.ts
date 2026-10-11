import { removeBackground as imglyRemoveBackground, Config } from '@imgly/background-removal';
import { BackgroundSettings } from '../types';
import { featherAlphaMask } from './imageFilters';

export interface RemoveBackgroundProgress {
  key: string;
  current: number;
  total: number;
  percentage: number;
}

/**
 * Executes client-side background removal using @imgly/background-removal
 */
export async function removeImageBackground(
  imageSource: string | Blob,
  onProgress?: (progress: RemoveBackgroundProgress) => void
): Promise<Blob> {
  const config: Config = {
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        onProgress({
          key,
          current,
          total,
          percentage: Math.round((current / total) * 100),
        });
      }
    },
    output: {
      format: 'image/png',
      quality: 1.0,
    },
  };

  return await imglyRemoveBackground(imageSource, config);
}

/**
 * Composites transparent cutout blob onto the selected background (solid, gradient, transparent)
 */
export async function compositeBackground(
  cutoutDataUrl: string,
  settings: BackgroundSettings,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

      // 1. Draw background
      if (settings.mode === 'solid') {
        ctx.fillStyle = settings.solidColor || '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else if (settings.mode === 'gradient') {
        const rad = ((settings.gradientAngle || 180) * Math.PI) / 180;
        const x1 = targetWidth / 2 - (Math.cos(rad) * targetWidth) / 2;
        const y1 = targetHeight / 2 - (Math.sin(rad) * targetHeight) / 2;
        const x2 = targetWidth / 2 + (Math.cos(rad) * targetWidth) / 2;
        const y2 = targetHeight / 2 + (Math.sin(rad) * targetHeight) / 2;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, settings.gradientStart || '#FFFFFF');
        grad.addColorStop(1, settings.gradientEnd || '#D4E6F1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else if (settings.mode === 'transparent') {
        // Clear canvas (transparent)
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      }

      // 2. Draw cutout image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 3. Feather edges if requested
      if (settings.featherRadius > 0 && settings.mode !== 'transparent') {
        featherAlphaMask(canvas, settings.featherRadius);
      }

      const format = settings.mode === 'transparent' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(format, 0.98));
    };
    img.onerror = reject;
    img.src = cutoutDataUrl;
  });
}
