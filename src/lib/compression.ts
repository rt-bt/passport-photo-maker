export interface CompressOptions {
  canvas: HTMLCanvasElement;
  targetSizeKb?: number | null;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  initialQuality?: number;
  maxIterations?: number;
  toleranceKb?: number;
}

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
  sizeBytes: number;
  quality: number;
  width: number;
  height: number;
  iterations: number;
  scaled: boolean;
}

/**
 * Helper to get blob from canvas with specific format & quality
 */
export function getCanvasBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      format,
      quality
    );
  });
}

/**
 * Helper to convert Blob to base64 DataURL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compresses canvas image using binary search on quality,
 * with optional progressive downscaling if quality limit alone is insufficient.
 */
export async function compressToTargetSize(
  options: CompressOptions
): Promise<CompressResult> {
  const {
    canvas,
    targetSizeKb,
    format = 'image/jpeg',
    initialQuality = 0.92,
    maxIterations = 10,
    toleranceKb = 1,
  } = options;

  let currentCanvas = canvas;
  let scaled = false;

  // If no target size specified, export at high quality
  if (!targetSizeKb || targetSizeKb <= 0) {
    const blob = await getCanvasBlob(currentCanvas, format, initialQuality);
    const dataUrl = await blobToDataUrl(blob);
    return {
      blob,
      dataUrl,
      sizeBytes: blob.size,
      quality: initialQuality,
      width: currentCanvas.width,
      height: currentCanvas.height,
      iterations: 1,
      scaled: false,
    };
  }

  const targetBytes = targetSizeKb * 1024;
  const toleranceBytes = toleranceKb * 1024;

  // PNG does not accept quality parameter in toBlob; if format is PNG and exceeds target,
  // we downscale dimensions directly.
  if (format === 'image/png') {
    let currentBlob = await getCanvasBlob(currentCanvas, format);
    let scale = 1.0;
    let iter = 1;

    while (currentBlob.size > targetBytes && iter <= maxIterations && scale > 0.2) {
      scale *= 0.85;
      scaled = true;
      const offscreen = document.createElement('canvas');
      offscreen.width = Math.round(canvas.width * scale);
      offscreen.height = Math.round(canvas.height * scale);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
        currentCanvas = offscreen;
      }
      currentBlob = await getCanvasBlob(currentCanvas, format);
      iter++;
    }

    const dataUrl = await blobToDataUrl(currentBlob);
    return {
      blob: currentBlob,
      dataUrl,
      sizeBytes: currentBlob.size,
      quality: 1,
      width: currentCanvas.width,
      height: currentCanvas.height,
      iterations: iter,
      scaled,
    };
  }

  // Binary search for JPEG / WEBP quality
  let low = 0.05;
  let high = 1.0;
  let bestBlob: Blob | null = null;
  let bestQuality = initialQuality;
  let iter = 0;

  // First check if max quality is already below target
  const maxBlob = await getCanvasBlob(currentCanvas, format, 1.0);
  if (maxBlob.size <= targetBytes) {
    const dataUrl = await blobToDataUrl(maxBlob);
    return {
      blob: maxBlob,
      dataUrl,
      sizeBytes: maxBlob.size,
      quality: 1.0,
      width: currentCanvas.width,
      height: currentCanvas.height,
      iterations: 1,
      scaled: false,
    };
  }

  while (low <= high && iter < maxIterations) {
    iter++;
    const mid = (low + high) / 2;
    const blob = await getCanvasBlob(currentCanvas, format, mid);

    if (blob.size <= targetBytes) {
      // It fits! Record it and try to search for higher quality
      bestBlob = blob;
      bestQuality = mid;
      // If within tolerance below target, good enough
      if (targetBytes - blob.size <= toleranceBytes) {
        break;
      }
      low = mid + 0.02;
    } else {
      // Too large, lower quality
      high = mid - 0.02;
    }
  }

  // If even at lowest quality it's still above target, downscale canvas dimensions
  if (!bestBlob || bestBlob.size > targetBytes) {
    let scale = 0.9;
    let downscaleIter = 0;

    while (downscaleIter < 8 && scale > 0.2) {
      downscaleIter++;
      scaled = true;
      const offscreen = document.createElement('canvas');
      offscreen.width = Math.round(canvas.width * scale);
      offscreen.height = Math.round(canvas.height * scale);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
        currentCanvas = offscreen;
      }

      // Try with medium quality 0.7 on the smaller canvas
      const testBlob = await getCanvasBlob(currentCanvas, format, 0.7);
      if (testBlob.size <= targetBytes) {
        bestBlob = testBlob;
        bestQuality = 0.7;
        break;
      }
      scale *= 0.85;
    }
  }

  // Fallback to lowest tested blob if still null
  if (!bestBlob) {
    bestBlob = await getCanvasBlob(currentCanvas, format, 0.5);
    bestQuality = 0.5;
  }

  const dataUrl = await blobToDataUrl(bestBlob);
  return {
    blob: bestBlob,
    dataUrl,
    sizeBytes: bestBlob.size,
    quality: Number(bestQuality.toFixed(2)),
    width: currentCanvas.width,
    height: currentCanvas.height,
    iterations: iter,
    scaled,
  };
}
