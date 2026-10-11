import { mmToPx } from './units';

/**
 * Extracts signature from paper background:
 * Converts white/off-white paper to 100% transparency, retaining dark pen strokes.
 */
export async function processSignature(
  imageSource: string | File,
  threshold: number = 200, // 0 to 255
  targetWidthMm: number = 35,
  targetHeightMm: number = 15,
  dpi: number = 300
): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  const srcUrl =
    typeof imageSource === 'string'
      ? imageSource
      : URL.createObjectURL(imageSource);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load signature image'));
    img.src = srcUrl;
  });

  const targetWidthPx = mmToPx(targetWidthMm, dpi);
  const targetHeightPx = mmToPx(targetHeightMm, dpi);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidthPx;
  canvas.height = targetHeightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    if (typeof imageSource !== 'string') URL.revokeObjectURL(srcUrl);
    throw new Error('Canvas 2D context unavailable');
  }

  // Draw scaled and centered with aspect ratio preserved
  const scale = Math.min(targetWidthPx / img.width, targetHeightPx / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const drawX = (targetWidthPx - drawWidth) / 2;
  const drawY = (targetHeightPx - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  // Process pixels to remove paper background
  const imgData = ctx.getImageData(0, 0, targetWidthPx, targetHeightPx);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Grayscale luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= threshold) {
      // Paper background -> completely transparent
      data[i + 3] = 0;
    } else {
      // Ink stroke: darken to pure black and set smooth alpha
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      // Alpha based on distance from threshold for antialiased ink edges
      const alpha = Math.min(255, Math.round(((threshold - lum) / threshold) * 255 * 1.5));
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (typeof imageSource !== 'string') URL.revokeObjectURL(srcUrl);
  return canvas.toDataURL('image/png');
}
