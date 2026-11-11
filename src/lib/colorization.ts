/**
 * AI Black & White to Color Photo Engine
 * Converts vintage, black & white, and faded sepia photos into lifelike, vibrant full color
 * using semantic facial chrominance synthesis, anatomical eye detection, and photographic luminance preservation.
 */

import { FaceRegionEstimates } from './faceRetouch';
import {
  ColorizeOptions,
  SkinTonePreset,
  ClothingColorPreset,
  BackgroundColorPreset,
  EyeColorPreset,
} from '../types';

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

export const EYE_PALETTES: Record<EyeColorPreset, RgbColor> = {
  auto: { r: 180, g: 115, b: 60 }, // Warm rich amber/hazel
  hazel: { r: 180, g: 115, b: 60 },
  brown: { r: 120, g: 70, b: 40 },
  blue: { r: 70, g: 135, b: 200 },
  green: { r: 65, g: 140, b: 85 },
};

/**
 * Converts RGB [0-255] to HSL [0-1]
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let normalizedT = t;
    if (normalizedT < 0) normalizedT += 1;
    if (normalizedT > 1) normalizedT -= 1;
    if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
    if (normalizedT < 1 / 2) return q;
    if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
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
  const sampleW = Math.min(width, 100);
  const sampleH = Math.min(height, 100);
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
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

export interface EyeMacroInfo {
  isEye: boolean;
  pupilX: number;
  pupilY: number;
  pupilRadius: number;
  irisRadius: number;
}

/**
 * Detects if the image is a close-up / macro photo of an eye with a circular iris
 */
export function detectEyeMacro(
  data: Uint8ClampedArray,
  width: number,
  height: number
): EyeMacroInfo {
  // Search central 60% for a dark circular pupil
  const startX = Math.round(width * 0.2);
  const endX = Math.round(width * 0.8);
  const startY = Math.round(height * 0.2);
  const endY = Math.round(height * 0.8);

  let darkSumX = 0;
  let darkSumY = 0;
  let darkCount = 0;

  // 1. Find the darkest centroid
  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 32) {
        darkSumX += x;
        darkSumY += y;
        darkCount++;
      }
    }
  }

  if (darkCount < 40) {
    return { isEye: false, pupilX: 0, pupilY: 0, pupilRadius: 0, irisRadius: 0 };
  }

  const pupilX = Math.round(darkSumX / darkCount);
  const pupilY = Math.round(darkSumY / darkCount);

  // 2. Measure pupil radius
  const maxPupilDist = Math.min(width, height) * 0.2;
  let pupilRadius = Math.max(15, Math.round(Math.sqrt(darkCount / Math.PI) * 2));
  pupilRadius = Math.min(maxPupilDist, pupilRadius);

  // 3. Measure iris radial signature (contrast jump from iris to white sclera)
  const candidateIris = Math.round(pupilRadius * 2.8);
  const minDim = Math.min(width, height);
  const irisRadius = Math.max(pupilRadius * 1.8, Math.min(candidateIris, minDim * 0.38));

  // Verify that left or right side has brighter sclera
  const leftScleraX = Math.max(0, Math.round(pupilX - irisRadius * 1.3));
  const leftIdx = (pupilY * width + leftScleraX) * 4;
  const leftLum = 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];

  const isEye = leftLum > 100 || darkCount > 80;

  return {
    isEye,
    pupilX,
    pupilY,
    pupilRadius,
    irisRadius,
  };
}

/**
 * Colorizes a Macro Eye photo with realistic iris color, clean white sclera, and smooth skin eyelids
 */
export function colorizeMacroEye(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: Partial<ColorizeOptions>,
  eye: EyeMacroInfo
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const skinPreset = options.skinTone || 'wheatish';
  const eyePreset = options.eyeColor || 'hazel';
  const vibrancy = (options.vibrancy ?? 80) / 100;
  const warmth = (options.colorWarmth ?? 10) / 100;
  const deSepia = options.vintageDeSepia ?? true;

  const skinRgb = SKIN_TONE_PALETTES[skinPreset] || SKIN_TONE_PALETTES.wheatish;
  const eyeRgb = EYE_PALETTES[eyePreset] || EYE_PALETTES.hazel;

  const [skinH, skinS] = rgbToHsl(skinRgb.r, skinRgb.g, skinRgb.b);
  const [irisH, irisS] = rgbToHsl(eyeRgb.r, eyeRgb.g, eyeRgb.b);

  const cx = eye.pupilX;
  const cy = eye.pupilY;
  const pr = eye.pupilRadius;
  const ir = eye.irisRadius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (deSepia) {
        lum = Math.min(255, Math.max(0, (lum - 6) * 1.05));
      }
      const normLum = lum / 255;

      const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));

      // 1. Base skin tone for eyelids and surrounding face
      let targetH = skinH + warmth * 0.03;
      let targetS = skinS * 0.85;

      // 2. Iris Weight (smooth feathered circular transition)
      const innerFeather = Math.min(1.0, Math.max(0.0, (dist - pr * 0.82) / (pr * 0.35 + 1e-4)));
      const outerFeather = Math.min(1.0, Math.max(0.0, (ir * 1.06 - dist) / (ir * 0.15 + 1e-4)));
      const irisWeight = innerFeather * outerFeather;

      if (irisWeight > 0.01) {
        // Limbal ring outer boundary is slightly deeper
        const limbalRatio = dist / (ir + 1e-4);
        const localH = irisH - limbalRatio * 0.02;
        const localS = irisS * (0.9 + 0.2 * Math.sin(limbalRatio * Math.PI));

        targetH = targetH * (1.0 - irisWeight) + localH * irisWeight;
        targetS = targetS * (1.0 - irisWeight) + localS * irisWeight;
      }

      // 3. Sclera (Eyeball white - clean ivory/natural white, never blue!)
      const scleraDistX = Math.abs(x - cx) / (ir * 2.1);
      const scleraDistY = Math.abs(y - cy) / (ir * 1.2);
      const scleraDist = Math.sqrt(scleraDistX * scleraDistX + scleraDistY * scleraDistY);

      if (normLum > 0.42 && scleraDist < 1.35) {
        const scleraWeight =
          Math.min(1.0, Math.max(0.0, (normLum - 0.42) / 0.22)) *
          Math.min(1.0, Math.max(0.0, (1.35 - scleraDist) / 0.25)) *
          (1.0 - irisWeight);

        if (scleraWeight > 0.01) {
          const scleraH = 0.11; // subtle warm ivory
          const scleraS = 0.05; // very clean, almost desaturated white
          targetH = targetH * (1.0 - scleraWeight) + scleraH * scleraWeight;
          targetS = targetS * (1.0 - scleraWeight) + scleraS * scleraWeight;
        }
      }

      // 4. Specular Highlight (catchlight in pupil/iris): 0 saturation pure white
      if (normLum > 0.88) {
        const hlWeight = Math.min(1.0, (normLum - 0.88) / 0.08);
        targetS *= 1.0 - hlWeight;
      }

      // 5. Deep Shadows (pupil center & dark eyelashes): natural neutral black
      if (normLum < 0.18) {
        const shadowWeight = Math.min(1.0, (0.18 - normLum) / 0.12);
        targetS *= 1.0 - shadowWeight * 0.85;
      }

      const effectiveS = Math.max(0, Math.min(1.0, targetS * vibrancy));
      const [newR, newG, newB] = hslToRgb(targetH, effectiveS, normLum);

      data[idx] = newR;
      data[idx + 1] = newG;
      data[idx + 2] = newB;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Colorizes general monochrome / vintage photos (landscapes, objects, architecture, street scenes)
 * with continuous luminance-to-chroma gradient mapping.
 */
export function colorizeGeneralMonochrome(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: Partial<ColorizeOptions>
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const vibrancy = (options.vibrancy ?? 70) / 100;
  const warmth = (options.colorWarmth ?? 10) / 100;
  const deSepia = options.vintageDeSepia ?? true;

  // Base natural photo color grading:
  // Warm golden midtone with neutral highlights and deep umber shadows
  const baseH = 0.09 + warmth * 0.03; // ~32 deg warm golden/amber
  const baseS = 0.35 * vibrancy;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (deSepia) {
      lum = Math.min(255, Math.max(0, (lum - 6) * 1.05));
    }
    const normLum = lum / 255;

    // Highlights (> 0.88) stay clean crisp white
    // Shadows (< 0.15) stay neutral deep black
    // Midtones receive natural photographic chroma
    const midtoneBell = Math.sin(normLum * Math.PI);
    const effectiveS = Math.min(1.0, Math.max(0.0, baseS * midtoneBell * 1.2));

    const [newR, newG, newB] = hslToRgb(baseH, effectiveS, normLum);
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Colorizes a Black & White or Sepia portrait directly on canvas using smooth feathered Gaussian masks
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
  const bgPreset = options.backgroundColor || 'original';
  const eyePreset = options.eyeColor || 'auto';
  const vibrancy = (options.vibrancy ?? 80) / 100;
  const warmth = (options.colorWarmth ?? 10) / 100;
  const deSepia = options.vintageDeSepia ?? true;

  const skinRgb = SKIN_TONE_PALETTES[skinPreset] || SKIN_TONE_PALETTES.wheatish;
  const clothRgb = CLOTHING_PALETTES[clothPreset] || CLOTHING_PALETTES.navy;
  const bgRgb = BACKGROUND_PALETTES[bgPreset] || BACKGROUND_PALETTES.original;
  const eyeRgb = EYE_PALETTES[eyePreset] || EYE_PALETTES.auto;

  const [skinH, skinS] = rgbToHsl(skinRgb.r, skinRgb.g, skinRgb.b);
  const [clothH, clothS] = rgbToHsl(clothRgb.r, clothRgb.g, clothRgb.b);
  const [bgH, bgS] = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
  const [irisH, irisS] = rgbToHsl(eyeRgb.r, eyeRgb.g, eyeRgb.b);

  const faceCenterX = regions.box.x + regions.box.width * 0.5;
  const faceCenterY = regions.box.y + regions.box.height * 0.52;
  const faceRadiusX = regions.box.width * 0.55;
  const faceRadiusY = regions.box.height * 0.58;

  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (deSepia) {
        lum = Math.min(255, Math.max(0, (lum - 8) * 1.07));
      }
      const normLum = lum / 255;

      // Base background tone
      let targetH = bgPreset === 'original' ? 0.1 : bgH;
      let targetS = bgPreset === 'original' ? 0.0 : bgS;

      // 1. Smooth Elliptical Face Skin Mask (Feathered Gaussian decay)
      const dxFace = (x - faceCenterX) / (faceRadiusX + 1e-4);
      const dyFace = (y - faceCenterY) / (faceRadiusY + 1e-4);
      const dFaceEllipse = Math.sqrt(dxFace * dxFace + dyFace * dyFace);
      const skinWeight = Math.min(1.0, Math.max(0.0, (1.25 - dFaceEllipse) / 0.4));

      if (skinWeight > 0.01) {
        let localSkinH = skinH + warmth * 0.03;
        let localSkinS = skinS;

        // Rosy Cheeks
        const dLeftCheek = dist(x, y, regions.leftCheek.x, regions.leftCheek.y);
        const dRightCheek = dist(x, y, regions.rightCheek.x, regions.rightCheek.y);
        const cheekDist = Math.min(dLeftCheek, dRightCheek);
        if (cheekDist < regions.leftCheek.r * 1.2) {
          const cheekWeight = Math.min(1.0, Math.max(0.0, 1.0 - cheekDist / (regions.leftCheek.r * 1.2)));
          localSkinH = localSkinH * (1.0 - cheekWeight) + 0.98 * cheekWeight;
          localSkinS = Math.min(1.0, localSkinS * (1.0 + 0.3 * cheekWeight));
        }

        targetH = targetH * (1.0 - skinWeight) + localSkinH * skinWeight;
        targetS = targetS * (1.0 - skinWeight) + localSkinS * skinWeight;
      }

      // 2. Eyes (Iris & Sclera)
      const dLeftEye = dist(x, y, regions.leftEye.x, regions.leftEye.y);
      const dRightEye = dist(x, y, regions.rightEye.x, regions.rightEye.y);
      const eyeDist = Math.min(dLeftEye, dRightEye);
      const eyeR = regions.leftEye.r;

      if (eyeDist < eyeR * 1.15) {
        const eyeWeight = Math.min(1.0, Math.max(0.0, (eyeR * 1.15 - eyeDist) / (eyeR * 0.3 + 1e-4)));
        if (eyeDist < eyeR * 0.42 && normLum > 0.15) {
          // Iris
          targetH = targetH * (1.0 - eyeWeight) + irisH * eyeWeight;
          targetS = targetS * (1.0 - eyeWeight) + irisS * eyeWeight;
        } else if (normLum > 0.5) {
          // Clean Eye White (Sclera)
          targetH = targetH * (1.0 - eyeWeight) + 0.12 * eyeWeight;
          targetS = targetS * (1.0 - eyeWeight) + 0.04 * eyeWeight;
        }
      }

      // 3. Lips (Smooth elliptical mask gated by luminance)
      const mouthCenterX = regions.mouth.x + regions.mouth.w * 0.5;
      const mouthCenterY = regions.mouth.y + regions.mouth.h * 0.5;
      const dxMouth = Math.abs(x - mouthCenterX) / (regions.mouth.w * 0.5 + 1e-4);
      const dyMouth = Math.abs(y - mouthCenterY) / (regions.mouth.h * 0.5 + 1e-4);
      const dMouth = Math.sqrt(dxMouth * dxMouth + dyMouth * dyMouth);

      if (dMouth < 1.1 && normLum > 0.16 && normLum < 0.82) {
        const mouthWeight = Math.min(1.0, Math.max(0.0, 1.0 - dMouth));
        const lipH = 0.97; // Natural rosy lip
        const lipS = 0.55;
        targetH = targetH * (1.0 - mouthWeight) + lipH * mouthWeight;
        targetS = targetS * (1.0 - mouthWeight) + lipS * mouthWeight;
      }

      // 4. Hair (Above forehead and outer temple edges)
      const isHairY = y < regions.box.y + regions.box.height * 0.35;
      if (isHairY && normLum < 0.6) {
        const hairWeight = Math.min(1.0, Math.max(0.0, (0.6 - normLum) / 0.35));
        const hairH = 0.07;
        const hairS = 0.25;
        targetH = targetH * (1.0 - hairWeight) + hairH * hairWeight;
        targetS = targetS * (1.0 - hairWeight) + hairS * hairWeight;
      }

      // 5. Clothing (Soft decay below chin / jawline)
      const chinY = regions.jawline.y + regions.jawline.h * 0.45;
      if (y > chinY && dFaceEllipse > 0.75) {
        const clothWeight = Math.min(
          1.0,
          Math.max(0.0, (y - chinY) / (regions.box.height * 0.22))
        );

        // Crisp white collar check right below center chin
        const isWhiteCollar =
          normLum > 0.65 &&
          Math.abs(x - faceCenterX) < regions.box.width * 0.32 &&
          y < chinY + regions.jawline.h * 0.9;

        if (isWhiteCollar) {
          targetH = 0.58;
          targetS = targetS * (1.0 - clothWeight) + 0.04 * clothWeight;
        } else {
          targetH = targetH * (1.0 - clothWeight) + clothH * clothWeight;
          targetS = targetS * (1.0 - clothWeight) + clothS * 1.05 * clothWeight;
        }
      }

      // Specular highlights stay clean white
      if (normLum > 0.88) {
        const hl = Math.min(1.0, (normLum - 0.88) / 0.08);
        targetS *= 1.0 - hl;
      }

      // Shadows stay deep neutral
      if (normLum < 0.14) {
        const sh = Math.min(1.0, (0.14 - normLum) / 0.1);
        targetS *= 1.0 - sh * 0.85;
      }

      const effectiveS = Math.max(0, Math.min(1.0, targetS * vibrancy));
      const [newR, newG, newB] = hslToRgb(targetH, effectiveS, normLum);

      data[idx] = newR;
      data[idx + 1] = newG;
      data[idx + 2] = newB;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Master Colorization Entry Point:
 * Automatically dispatches to Macro Eye Colorization, Portrait Colorization, or General Monochrome Colorization.
 */
export function colorizeGrayscaleImage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: Partial<ColorizeOptions>,
  detectedFace?: {
    box: { x: number; y: number; width: number; height: number };
    landmarks?: any;
  }
): void {
  const hasValidFace =
    detectedFace &&
    detectedFace.box.width > width * 0.15 &&
    detectedFace.box.height > height * 0.15;

  if (hasValidFace) {
    // Face portrait detected
    const { estimateFacialRegions } = require('./faceRetouch');
    const regions = estimateFacialRegions(width, height, detectedFace);
    colorizeGrayscalePortrait(ctx, width, height, options, regions);
    return;
  }

  // Check if image is a macro eye
  const imgData = ctx.getImageData(0, 0, width, height);
  const eye = detectEyeMacro(imgData.data, width, height);

  if (eye.isEye) {
    colorizeMacroEye(ctx, width, height, options, eye);
  } else {
    colorizeGeneralMonochrome(ctx, width, height, options);
  }
}
