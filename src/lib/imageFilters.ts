import { PhotoAdjustments } from '../types';

/**
 * Applies brightness, contrast, sharpness, and skin smoothing to an ImageData buffer
 */
export function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: PhotoAdjustments
) {
  if (
    adjustments.brightness === 0 &&
    adjustments.contrast === 0 &&
    adjustments.sharpness === 0 &&
    adjustments.smoothness === 0
  ) {
    return;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Brightness & Contrast
  const brightness = adjustments.brightness * 1.5; // -150 to 150
  const contrastFactor =
    (259 * (adjustments.contrast * 2.55 + 255)) /
    (255 * (259 - adjustments.contrast * 2.55));

  for (let i = 0; i < data.length; i += 4) {
    // Red
    let r = data[i] + brightness;
    r = contrastFactor * (r - 128) + 128;
    data[i] = Math.min(255, Math.max(0, r));

    // Green
    let g = data[i + 1] + brightness;
    g = contrastFactor * (g - 128) + 128;
    data[i + 1] = Math.min(255, Math.max(0, g));

    // Blue
    let b = data[i + 2] + brightness;
    b = contrastFactor * (b - 128) + 128;
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // 2. Skin Smoothness (selective low-pass filter on skin tones)
  if (adjustments.smoothness > 0) {
    applySkinSmooth(ctx, width, height, adjustments.smoothness / 100);
  }

  // 3. Sharpness (Convolution 3x3 unsharp mask)
  if (adjustments.sharpness > 0) {
    applySharpness(ctx, width, height, adjustments.sharpness / 100);
  }
}

/**
 * Gentle skin smoothing filter preserving strong edges
 */
function applySkinSmooth(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const copy = new Uint8ClampedArray(src);

  const radius = Math.max(1, Math.round(strength * 2));
  const intensity = strength * 0.7;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];

      // Rough skin tone heuristic: R > G > B, R - G >= 15, R > 60
      const isSkin = r > 60 && g > 40 && b > 20 && r > g && g > b && r - g >= 10;
      if (!isSkin) continue;

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nr = copy[nIdx];
          const ng = copy[nIdx + 1];
          const nb = copy[nIdx + 2];

          // Edge threshold: only blur pixels with similar color
          if (
            Math.abs(nr - r) < 30 &&
            Math.abs(ng - g) < 30 &&
            Math.abs(nb - b) < 30
          ) {
            sumR += nr;
            sumG += ng;
            sumB += nb;
            count++;
          }
        }
      }

      if (count > 0) {
        src[idx] = Math.round(r * (1 - intensity) + (sumR / count) * intensity);
        src[idx + 1] = Math.round(g * (1 - intensity) + (sumG / count) * intensity);
        src[idx + 2] = Math.round(b * (1 - intensity) + (sumB / count) * intensity);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * 3x3 Unsharp mask convolution filter for crisp eyes and hair
 */
function applySharpness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const copy = new Uint8ClampedArray(src);

  // Kernel: [0, -a, 0; -a, 1+4a, -a; 0, -a, 0]
  const a = amount * 0.6;
  const centerWeight = 1 + 4 * a;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const top = ((y - 1) * width + x) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          copy[idx + c] * centerWeight -
          a * (copy[top + c] + copy[bottom + c] + copy[left + c] + copy[right + c]);
        src[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Softens/feathers alpha channel edges of a transparent cutout canvas
 */
export function featherAlphaMask(
  canvas: HTMLCanvasElement,
  featherRadius: number
) {
  if (featherRadius <= 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const alphaCopy = new Uint8ClampedArray(canvas.width * canvas.height);

  for (let i = 0; i < alphaCopy.length; i++) {
    alphaCopy[i] = data[i * 4 + 3];
  }

  const r = Math.min(5, Math.round(featherRadius));
  const w = canvas.width;
  const h = canvas.height;

  for (let y = r; y < h - r; y++) {
    for (let x = r; x < w - r; x++) {
      const idx = y * w + x;
      // Only feather border transition pixels
      if (alphaCopy[idx] > 0 && alphaCopy[idx] < 255) {
        let sum = 0;
        let count = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            sum += alphaCopy[(y + dy) * w + (x + dx)];
            count++;
          }
        }
        data[idx * 4 + 3] = Math.round(sum / count);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
