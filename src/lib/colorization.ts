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
  auto: { r: 228, g: 182, b: 148 }, // Default wheatish / natural
  wheatish: { r: 228, g: 182, b: 148 }, // Classic natural South Asian / Mediterranean
  fair: { r: 244, g: 206, b: 186 },
  medium: { r: 216, g: 170, b: 135 },
  olive: { r: 198, g: 154, b: 118 },
  deep: { r: 148, g: 104, b: 76 },
};

export const CLOTHING_PALETTES: Record<ClothingColorPreset, RgbColor> = {
  auto: { r: 35, g: 58, b: 98 }, // Classic Navy Blue
  navy: { r: 35, g: 58, b: 98 },
  black: { r: 30, g: 30, b: 32 },
  charcoal: { r: 55, g: 60, b: 68 },
  maroon: { r: 105, g: 32, b: 45 },
  royal_blue: { r: 42, g: 82, b: 148 },
  forest_green: { r: 38, g: 72, b: 52 },
};

export const BACKGROUND_PALETTES: Record<BackgroundColorPreset, RgbColor> = {
  original: { r: 215, g: 220, b: 228 },
  studio_blue: { r: 182, g: 210, b: 238 },
  passport_blue: { r: 72, g: 138, b: 212 },
  light_gray: { r: 222, g: 224, b: 228 },
  off_white: { r: 245, g: 245, b: 246 },
};

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
  // If average color variance between channels is low (< 18), it is B&W or faint sepia
  return avgDiff < 18;
}

/**
 * Colorizes a Black & White or Sepia portrait directly on canvas
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
  const vibrancy = (options.vibrancy ?? 70) / 100;
  const warmth = (options.colorWarmth ?? 10) / 100;
  const deSepia = options.vintageDeSepia ?? true;

  const skinBase = SKIN_TONE_PALETTES[skinPreset] || SKIN_TONE_PALETTES.wheatish;
  const clothBase = CLOTHING_PALETTES[clothPreset] || CLOTHING_PALETTES.navy;
  const bgBase = BACKGROUND_PALETTES[bgPreset] || BACKGROUND_PALETTES.studio_blue;

  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

  const totalPixels = width * height;

  // Face center and boundaries
  const faceCenterX = regions.box.x + regions.box.width * 0.5;
  const faceCenterY = regions.box.y + regions.box.height * 0.5;
  const faceRadius = Math.max(regions.box.width, regions.box.height) * 0.58;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // 1. Calculate neutral grayscale luminance (removes old sepia staining)
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (deSepia) {
        // Stretch contrast slightly for clean deep blacks and bright whites
        lum = Math.min(255, Math.max(0, (lum - 10) * 1.08));
      }
      const normLum = lum / 255;

      // 2. Identify semantic facial & portrait zone
      let targetR = bgBase.r;
      let targetG = bgBase.g;
      let targetB = bgBase.b;
      let zoneType: 'skin' | 'eye' | 'lip' | 'hair' | 'cloth' | 'bg' = 'bg';

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

      // Hair Zone (Above eyes, crown, temples, sides)
      const isHair =
        (y < regions.box.y + regions.box.height * 0.25 &&
          Math.abs(x - faceCenterX) < regions.box.width * 0.55) ||
        (y < regions.box.y + regions.box.height * 0.45 &&
          (x < regions.box.x + regions.box.width * 0.15 ||
            x > regions.box.x + regions.box.width * 0.85) &&
          dFace < faceRadius * 1.15);

      // Clothing Zone (Below chin / jawline)
      const isClothing = y > regions.jawline.y + regions.jawline.h * 0.35 && dFace > faceRadius * 0.7;

      if (isClothing) {
        zoneType = 'cloth';
        // If near center top of clothing and bright -> formal shirt collar (clean off-white)
        const isShirtCollar =
          normLum > 0.65 &&
          Math.abs(x - faceCenterX) < regions.box.width * 0.35 &&
          y < regions.jawline.y + regions.jawline.h * 1.2;

        if (isShirtCollar) {
          targetR = 245;
          targetG = 246;
          targetB = 248;
        } else {
          targetR = clothBase.r;
          targetG = clothBase.g;
          targetB = clothBase.b;
        }
      } else if (isHair && normLum < 0.55) {
        zoneType = 'hair';
        // Rich natural dark chestnut/black hair
        targetR = 38;
        targetG = 30;
        targetB = 28;
      } else if (isEye) {
        zoneType = 'eye';
        const eyeDist = Math.min(dLeftEye, dRightEye);
        if (eyeDist < regions.leftEye.r * 0.45) {
          // Iris / Pupil: natural warm dark brown
          targetR = 75;
          targetG = 50;
          targetB = 40;
        } else {
          // Sclera: clean natural eye white
          targetR = 242;
          targetG = 244;
          targetB = 246;
        }
      } else if (isMouth && normLum > 0.15 && normLum < 0.78) {
        zoneType = 'lip';
        // Natural rosy/pink lip pigmentation
        targetR = Math.min(255, skinBase.r + 28);
        targetG = Math.max(0, skinBase.g - 35);
        targetB = Math.max(0, skinBase.b - 15);
      } else if (dFace < faceRadius || isInsideFaceBounds) {
        zoneType = 'skin';
        targetR = skinBase.r;
        targetG = skinBase.g;
        targetB = skinBase.b;

        // Subtle anatomical skin gradients:
        // Cheeks: slightly warmer rosy blush
        const dLeftCheek = dist(x, y, regions.leftCheek.x, regions.leftCheek.y);
        const dRightCheek = dist(x, y, regions.rightCheek.x, regions.rightCheek.y);
        if (dLeftCheek < regions.leftCheek.r || dRightCheek < regions.rightCheek.r) {
          targetR = Math.min(255, targetR + 14);
          targetG = Math.max(0, targetG - 4);
        }

        // Forehead: golden radiant warmth
        if (y < regions.box.y + regions.box.height * 0.35) {
          targetR = Math.min(255, targetR + 6);
          targetG = Math.min(255, targetG + 4);
        }
      } else {
        zoneType = 'bg';
        targetR = bgBase.r;
        targetG = bgBase.g;
        targetB = bgBase.b;
      }

      // 3. Apply Color Warmth modifier
      if (warmth !== 0 && (zoneType === 'skin' || zoneType === 'hair')) {
        targetR = Math.min(255, targetR + warmth * 18);
        targetG = Math.min(255, targetG + warmth * 6);
        targetB = Math.max(0, targetB - warmth * 12);
      }

      // 4. Photographic Luminance Synthesis:
      // Preserves 100% of original lighting, shading, wrinkles, and sharpness
      // while injecting realistic chrominance
      let colorR = (targetR / 255) * lum * (1.6 - 0.6 * normLum);
      let colorG = (targetG / 255) * lum * (1.6 - 0.6 * normLum);
      let colorB = (targetB / 255) * lum * (1.6 - 0.6 * normLum);

      // 5. Vibrancy Blend (mix with original grayscale for photorealistic saturation)
      const blend = Math.max(0.1, Math.min(1.0, vibrancy));
      r = Math.round(lum * (1 - blend) + colorR * blend);
      g = Math.round(lum * (1 - blend) + colorG * blend);
      b = Math.round(lum * (1 - blend) + colorB * blend);

      // Clamp
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
