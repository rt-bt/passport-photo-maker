/**
 * AI Black & White to Color Photo Engine
 * Converts vintage, black & white, and faded sepia photos into lifelike, vibrant full color
 * using semantic facial chrominance synthesis and photographic luminance preservation.
 */

import { FaceRegionEstimates } from './faceRetouch';
import { ColorizeOptions, SkinTonePreset, ClothingColorPreset, BackgroundColorPreset } from '../types';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const SKIN_TONE_PALETTES: Record<SkinTonePreset, RgbColor> = {
  auto: { r: 232, g: 172, b: 130 },
  wheatish: { r: 232, g: 172, b: 130 }, // Rich natural South Asian / Wheatish
  fair: { r: 248, g: 198, b: 172 },
  medium: { r: 220, g: 158, b: 118 },
  olive: { r: 202, g: 148, b: 104 },
  deep: { r: 152, g: 98, b: 68 },
};

export const CLOTHING_PALETTES: Record<ClothingColorPreset, RgbColor> = {
  auto: { r: 28, g: 56, b: 110 }, // Classic Navy Blue
  navy: { r: 28, g: 56, b: 110 },
  black: { r: 28, g: 28, b: 30 },
  charcoal: { r: 48, g: 54, b: 64 },
  maroon: { r: 118, g: 28, b: 42 },
  royal_blue: { r: 35, g: 82, b: 158 },
  forest_green: { r: 32, g: 76, b: 48 },
};

export const BACKGROUND_PALETTES: Record<BackgroundColorPreset, RgbColor> = {
  original: { r: 215, g: 220, b: 228 },
  studio_blue: { r: 65, g: 142, b: 218 }, // Clear vibrant studio blue
  passport_blue: { r: 45, g: 118, b: 205 },
  light_gray: { r: 216, g: 218, b: 222 },
  off_white: { r: 242, g: 242, b: 244 },
};

/**
 * Converts RGB [0-255] to HSL [0-1]
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h, s, l];
}

/**
 * Converts HSL [0-1] to RGB [0-255]
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Checks if an image is grayscale, black & white, or sepia aged
 */
export function isImageGrayscaleOrSepia(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  const imgData = ctx.getImageData(0, 0, Math.min(width, 100), Math.min(height, 100));
  const data = imgData.data;
  let colorDiffSum = 0;
  const count = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    colorDiffSum += Math.abs(r - g) + Math.abs(g - b);
  }

  const avgDiff = colorDiffSum / count;
  return avgDiff < 18;
}

/**
 * Colorizes a Black & White or Sepia portrait directly on canvas using photographic HSL transfer
 */
export function colorizeGrayscalePortrait(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: Partial<ColorizeOptions>,
  regions: FaceRegionEstimates
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const skinPreset = options.skinTone || 'wheatish';
  const clothPreset = options.clothingColor || 'navy';
  const bgPreset = options.backgroundColor || 'studio_blue';
  const vibrancy = (options.vibrancy ?? 80) / 100;
  const warmth = (options.colorWarmth ?? 10) / 100;
  const deSepia = options.vintageDeSepia ?? true;

  const skinRgb = SKIN_TONE_PALETTES[skinPreset] || SKIN_TONE_PALETTES.wheatish;
  const clothRgb = CLOTHING_PALETTES[clothPreset] || CLOTHING_PALETTES.navy;
  const bgRgb = BACKGROUND_PALETTES[bgPreset] || BACKGROUND_PALETTES.studio_blue;

  // Extract base HSL for each semantic palette
  const [skinH, skinS] = rgbToHsl(skinRgb.r, skinRgb.g, skinRgb.b);
  const [clothH, clothS] = rgbToHsl(clothRgb.r, clothRgb.g, clothRgb.b);
  const [bgH, bgS] = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

  // Face metrics
  const faceCenterX = regions.box.x + regions.box.width * 0.5;
  const faceCenterY = regions.box.y + regions.box.height * 0.52;
  const faceRadius = Math.max(regions.box.width, regions.box.height) * 0.56;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // 1. Calculate neutral grayscale luminance (normalizes old sepia stains)
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (deSepia) {
        lum = Math.min(255, Math.max(0, (lum - 8) * 1.07));
      }
      const normLum = lum / 255;

      // 2. Identify semantic facial & portrait zone
      let targetH = bgH;
      let targetS = bgS;
      let targetL = normLum;

      // Distance from face center
      const dFace = dist(x, y, faceCenterX, faceCenterY);
      const isInsideFaceBounds =
        x >= regions.box.x &&
        x <= regions.box.x + regions.box.width &&
        y >= regions.box.y &&
        y <= regions.box.y + regions.box.height;

      // Eye distances
      const dLeftEye = dist(x, y, regions.leftEye.x, regions.leftEye.y);
      const dRightEye = dist(x, y, regions.rightEye.x, regions.rightEye.y);
      const isEye = dLeftEye < regions.leftEye.r || dRightEye < regions.rightEye.r;

      // Mouth bounds
      const isMouth =
        x >= regions.mouth.x &&
        x <= regions.mouth.x + regions.mouth.w &&
        y >= regions.mouth.y &&
        y <= regions.mouth.y + regions.mouth.h;

      // Hair Zone (Above forehead and outer temple edges)
      const isHair =
        (y < regions.box.y + regions.box.height * 0.28 &&
          Math.abs(x - faceCenterX) < regions.box.width * 0.6) ||
        (y < regions.box.y + regions.box.height * 0.48 &&
          (x < regions.box.x + regions.box.width * 0.12 ||
            x > regions.box.x + regions.box.width * 0.88) &&
          dFace < faceRadius * 1.18);

      // Clothing Zone (Below chin / jawline)
      const isClothing = y > regions.jawline.y + regions.jawline.h * 0.32 && dFace > faceRadius * 0.68;

      if (isClothing) {
        // Formal white shirt collar check right under chin
        const isShirtCollar =
          normLum > 0.62 &&
          Math.abs(x - faceCenterX) < regions.box.width * 0.38 &&
          y < regions.jawline.y + regions.jawline.h * 1.25;

        if (isShirtCollar) {
          targetH = 0.58; // crisp cool white
          targetS = 0.05;
        } else {
          targetH = clothH;
          targetS = clothS * 1.1;
        }
      } else if (isHair && normLum < 0.58) {
        // Natural rich deep brown/black hair
        targetH = 0.07; // warm dark tone
        targetS = 0.35;
      } else if (isEye) {
        const eyeDist = Math.min(dLeftEye, dRightEye);
        if (eyeDist < regions.leftEye.r * 0.42) {
          // Iris / Pupil: natural warm amber-brown
          targetH = 0.08;
          targetS = 0.65;
        } else {
          // Sclera: clean natural eye white
          targetH = 0.55;
          targetS = 0.08;
        }
      } else if (isMouth && normLum > 0.12 && normLum < 0.82) {
        // Natural rosy/pink lip pigmentation
        targetH = 0.96; // red/pink hue
        targetS = 0.55;
      } else if (dFace < faceRadius || isInsideFaceBounds) {
        // Skin Zone: apply selected skin tone palette
        targetH = skinH + warmth * 0.04;
        targetS = skinS;

        // Rosy blush on cheeks
        const dLeftCheek = dist(x, y, regions.leftCheek.x, regions.leftCheek.y);
        const dRightCheek = dist(x, y, regions.rightCheek.x, regions.rightCheek.y);
        if (dLeftCheek < regions.leftCheek.r || dRightCheek < regions.rightCheek.r) {
          targetH = Math.max(0.01, targetH - 0.02);
          targetS = Math.min(1.0, targetS * 1.15);
        }
      } else {
        // Background Zone: apply selected studio backdrop
        targetH = bgH;
        targetS = bgS * 1.1;
      }

      // 3. Synthesize photographic RGB from Target HSL
      const effectiveS = Math.max(0, Math.min(1.0, targetS * vibrancy));
      const [newR, newG, newB] = hslToRgb(targetH, effectiveS, targetL);

      data[idx] = newR;
      data[idx + 1] = newG;
      data[idx + 2] = newB;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
