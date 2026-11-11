/**
 * Granular Facial Precision Retouching & Sculpting Engine
 * Provides part-by-part manual control for eyes, nose, lips, ears, skin texture, and jawline face cutting.
 */

import { FacialPartControls } from '../types';

export interface FaceRegionEstimates {
  box: { x: number; y: number; width: number; height: number };
  leftEye: { x: number; y: number; r: number };
  rightEye: { x: number; y: number; r: number };
  nose: { x: number; y: number; w: number; h: number };
  mouth: { x: number; y: number; w: number; h: number };
  leftEar: { x: number; y: number; w: number; h: number };
  rightEar: { x: number; y: number; w: number; h: number };
  jawline: { x: number; y: number; w: number; h: number };
  forehead: { x: number; y: number; w: number; h: number };
  leftCheek: { x: number; y: number; r: number };
  rightCheek: { x: number; y: number; r: number };
}

/**
 * Estimates detailed facial regions from a detected face box or normalized landmarks
 */
export function estimateFacialRegions(
  imgW: number,
  imgH: number,
  detectedFace?: {
    box: { x: number; y: number; width: number; height: number };
    landmarks?: {
      leftEye?: { x: number; y: number };
      rightEye?: { x: number; y: number };
      nose?: { x: number; y: number };
      mouth?: { x: number; y: number };
    };
  }
): FaceRegionEstimates {
  const box = detectedFace?.box || {
    x: Math.round(imgW * 0.2),
    y: Math.round(imgH * 0.15),
    width: Math.round(imgW * 0.6),
    height: Math.round(imgH * 0.7),
  };

  const lm = detectedFace?.landmarks;
  const eyeY = lm?.leftEye?.y ? lm.leftEye.y * imgH : box.y + box.height * 0.36;
  const leftEyeX = lm?.leftEye?.x ? lm.leftEye.x * imgW : box.x + box.width * 0.32;
  const rightEyeX = lm?.rightEye?.x ? lm.rightEye.x * imgW : box.x + box.width * 0.68;
  const eyeRadius = Math.max(12, Math.round(box.width * 0.14));

  const noseX = lm?.nose?.x ? lm.nose.x * imgW : box.x + box.width * 0.5;
  const noseY = lm?.nose?.y ? lm.nose.y * imgH : box.y + box.height * 0.54;

  const mouthX = lm?.mouth?.x ? lm.mouth.x * imgW : box.x + box.width * 0.5;
  const mouthY = lm?.mouth?.y ? lm.mouth.y * imgH : box.y + box.height * 0.76;

  return {
    box,
    leftEye: { x: leftEyeX, y: eyeY, r: eyeRadius },
    rightEye: { x: rightEyeX, y: eyeY, r: eyeRadius },
    nose: {
      x: noseX - box.width * 0.14,
      y: noseY - box.height * 0.18,
      w: box.width * 0.28,
      h: box.height * 0.26,
    },
    mouth: {
      x: mouthX - box.width * 0.24,
      y: mouthY - box.height * 0.1,
      w: box.width * 0.48,
      h: box.height * 0.2,
    },
    leftEar: {
      x: Math.max(0, box.x - box.width * 0.12),
      y: box.y + box.height * 0.35,
      w: box.width * 0.16,
      h: box.height * 0.35,
    },
    rightEar: {
      x: Math.min(imgW - box.width * 0.16, box.x + box.width * 0.96),
      y: box.y + box.height * 0.35,
      w: box.width * 0.16,
      h: box.height * 0.35,
    },
    jawline: {
      x: box.x + box.width * 0.1,
      y: box.y + box.height * 0.72,
      w: box.width * 0.8,
      h: box.height * 0.32,
    },
    forehead: {
      x: box.x + box.width * 0.15,
      y: Math.max(0, box.y - box.height * 0.05),
      w: box.width * 0.7,
      h: box.height * 0.32,
    },
    leftCheek: {
      x: box.x + box.width * 0.22,
      y: box.y + box.height * 0.56,
      r: Math.round(box.width * 0.16),
    },
    rightCheek: {
      x: box.x + box.width * 0.78,
      y: box.y + box.height * 0.56,
      r: Math.round(box.width * 0.16),
    },
  };
}

/**
 * Applies part-by-part manual facial retouching directly on canvas
 */
export function applyFacialPartRetouching(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  controls: Partial<FacialPartControls>,
  regions: FaceRegionEstimates
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const irisClarity = (controls.irisClarity ?? 0) / 100;
  const eyeWhiten = (controls.eyeWhiten ?? 0) / 100;
  const eyebrowDefine = (controls.eyebrowDefine ?? 0) / 100;
  const eyeBagRemoval = (controls.eyeBagRemoval ?? 0) / 100;

  const noseBridgeDefine = (controls.noseBridgeDefine ?? 0) / 100;
  const noseContour = (controls.noseContour ?? 0) / 100;

  const lipVibrancy = (controls.lipVibrancy ?? 0) / 100;
  const lipContour = (controls.lipContour ?? 0) / 100;
  const teethWhiten = (controls.teethWhiten ?? 0) / 100;

  const earDefine = (controls.earDefine ?? 0) / 100;
  const hairlineSharpen = (controls.hairlineSharpen ?? 0) / 100;

  const skinSmoothing = (controls.skinSmoothing ?? 0) / 100;
  const skinGlow = (controls.skinGlow ?? 0) / 100;
  const antiGlare = (controls.antiGlare ?? 0) / 100;

  const jawlineSharpen = (controls.jawlineSharpen ?? 0) / 100;
  const cheekboneLift = (controls.cheekboneLift ?? 0) / 100;
  const neckShadowLift = (controls.neckShadowLift ?? 0) / 100;

  // Helper distance function
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

  // Loop through pixels inside the facial bounding box region
  const minX = Math.max(0, Math.floor(regions.box.x - regions.box.width * 0.2));
  const maxX = Math.min(width - 1, Math.ceil(regions.box.x + regions.box.width * 1.2));
  const minY = Math.max(0, Math.floor(regions.box.y - regions.box.height * 0.15));
  const maxY = Math.min(height - 1, Math.ceil(regions.box.y + regions.box.height * 1.25));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * width + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // -------------------------------------------------------------
      // 1. EYES (Iris Clarity, Sclera Whitening, Under-eye Bags, Brows)
      // -------------------------------------------------------------
      const dLeftEye = dist(x, y, regions.leftEye.x, regions.leftEye.y);
      const dRightEye = dist(x, y, regions.rightEye.x, regions.rightEye.y);
      const isEyeZone = dLeftEye < regions.leftEye.r || dRightEye < regions.rightEye.r;

      if (isEyeZone) {
        const eyeDist = Math.min(dLeftEye, dRightEye);
        const weight = 1.0 - eyeDist / regions.leftEye.r;

        // A. Iris Clarity (boost pupil depth & corneal catchlight)
        if (irisClarity > 0) {
          if (lum < 0.35) {
            // Deepen pupil & iris border
            const factor = 1.0 - irisClarity * 0.45 * weight;
            r *= factor;
            g *= factor;
            b *= factor;
          } else if (lum > 0.7) {
            // Brighten catchlight highlight
            const factor = 1.0 + irisClarity * 0.35 * weight;
            r = Math.min(255, r * factor);
            g = Math.min(255, g * factor);
            b = Math.min(255, b * factor);
          }
        }

        // B. Sclera Whitening (removes yellow/red bloodshot tint from eye whites)
        if (eyeWhiten > 0 && lum > 0.45 && lum < 0.95) {
          // Desaturate sclera towards pure white
          const avg = (r + g + b) / 3;
          const whitenFactor = eyeWhiten * 0.65 * weight;
          r = Math.round(r * (1 - whitenFactor) + (avg + 15) * whitenFactor);
          g = Math.round(g * (1 - whitenFactor) + (avg + 15) * whitenFactor);
          b = Math.round(b * (1 - whitenFactor) + (avg + 18) * whitenFactor);
        }

        // C. Under-eye Dark Circle / Eye Bag Eraser
        if (eyeBagRemoval > 0 && y > regions.leftEye.y + 4 && y < regions.leftEye.y + regions.leftEye.r * 1.3) {
          if (lum < 0.55) {
            // Lift under-eye dark shadows
            const lift = eyeBagRemoval * 32 * weight * (0.55 - lum);
            r = Math.min(255, r + lift * 1.1);
            g = Math.min(255, g + lift * 0.9);
            b = Math.min(255, b + lift * 0.7);
          }
        }
      }

      // Eyebrow Definition (just above eyes)
      if (eyebrowDefine > 0) {
        const isBrowZone =
          (Math.abs(x - regions.leftEye.x) < regions.leftEye.r * 1.2 ||
            Math.abs(x - regions.rightEye.x) < regions.rightEye.r * 1.2) &&
          y > regions.leftEye.y - regions.leftEye.r * 1.5 &&
          y < regions.leftEye.y - regions.leftEye.r * 0.4;

        if (isBrowZone && lum < 0.45) {
          const factor = 1.0 - eyebrowDefine * 0.4;
          r *= factor;
          g *= factor;
          b *= factor;
        }
      }

      // -------------------------------------------------------------
      // 2. NOSE (Bridge Specular Highlight & 3D Contour Shadows)
      // -------------------------------------------------------------
      if (
        x >= regions.nose.x &&
        x <= regions.nose.x + regions.nose.w &&
        y >= regions.nose.y &&
        y <= regions.nose.y + regions.nose.h
      ) {
        const normNoseX = (x - regions.nose.x) / regions.nose.w; // 0 (left) to 1 (right)
        const centerDist = Math.abs(normNoseX - 0.5) * 2; // 0 at ridge, 1 at wings

        // A. Nose Bridge Definition (brighten center ridge highlight)
        if (noseBridgeDefine > 0 && centerDist < 0.35 && lum > 0.4) {
          const boost = noseBridgeDefine * 28 * (1 - centerDist / 0.35);
          r = Math.min(255, r + boost);
          g = Math.min(255, g + boost);
          b = Math.min(255, b + boost);
        }

        // B. Nose 3D Contour (deepen natural side shadows for chiseled look)
        if (noseContour > 0 && centerDist > 0.45 && centerDist < 0.9) {
          const contourFactor = 1.0 - noseContour * 0.22 * (centerDist - 0.45);
          r *= contourFactor;
          g *= contourFactor;
          b *= contourFactor;
        }
      }

      // -------------------------------------------------------------
      // 3. LIPS & TEETH (Vibrancy, Contour & Teeth Whitening)
      // -------------------------------------------------------------
      if (
        x >= regions.mouth.x &&
        x <= regions.mouth.x + regions.mouth.w &&
        y >= regions.mouth.y &&
        y <= regions.mouth.y + regions.mouth.h
      ) {
        const isLipHue = r > g && r > b;

        // A. Teeth Whitening (center area, high luminance)
        const isTeethZone =
          Math.abs(x - (regions.mouth.x + regions.mouth.w * 0.5)) < regions.mouth.w * 0.25 &&
          Math.abs(y - (regions.mouth.y + regions.mouth.h * 0.5)) < regions.mouth.h * 0.3 &&
          lum > 0.45;

        if (teethWhiten > 0 && isTeethZone) {
          const avg = (r + g + b) / 3;
          const whitenFactor = teethWhiten * 0.7;
          r = Math.round(r * (1 - whitenFactor) + (avg + 25) * whitenFactor);
          g = Math.round(g * (1 - whitenFactor) + (avg + 25) * whitenFactor);
          b = Math.round(b * (1 - whitenFactor) + (avg + 28) * whitenFactor);
        } else if (lipVibrancy > 0 && isLipHue) {
          // B. Lip Vibrancy & Natural Pink Tone
          r = Math.min(255, r + lipVibrancy * 28);
          g = Math.max(0, g - lipVibrancy * 6);
          b = Math.min(255, b + lipVibrancy * 12);
        }

        // C. Lip Contour
        if (lipContour > 0 && isLipHue && (lum < 0.35 || lum > 0.65)) {
          r = lum < 0.35 ? r * (1 - lipContour * 0.25) : Math.min(255, r * (1 + lipContour * 0.15));
        }
      }

      // -------------------------------------------------------------
      // 4. FACE CUTTING & JAWLINE SCULPTING (Jawline, Cheekbone, Neck)
      // -------------------------------------------------------------
      // A. Jawline Definition & Face Cutting (sharp separation from neck)
      if (
        jawlineSharpen > 0 &&
        x >= regions.jawline.x &&
        x <= regions.jawline.x + regions.jawline.w &&
        y >= regions.jawline.y &&
        y <= regions.jawline.y + regions.jawline.h
      ) {
        const normJawY = (y - regions.jawline.y) / regions.jawline.h;
        if (normJawY > 0.4 && lum < 0.5) {
          // Deepen neck shadow under jaw to give sharp chiseled face cutting
          const jawCutFactor = 1.0 - jawlineSharpen * 0.32 * (normJawY - 0.4);
          r *= jawCutFactor;
          g *= jawCutFactor;
          b *= jawCutFactor;
        } else if (normJawY <= 0.4 && lum > 0.45) {
          // Highlight chin ridge
          const chinLift = jawlineSharpen * 16 * (1 - normJawY);
          r = Math.min(255, r + chinLift);
          g = Math.min(255, g + chinLift);
          b = Math.min(255, b + chinLift);
        }
      }

      // B. Cheekbone Lift / 3D Contour
      if (cheekboneLift > 0) {
        const dLeftCheek = dist(x, y, regions.leftCheek.x, regions.leftCheek.y);
        const dRightCheek = dist(x, y, regions.rightCheek.x, regions.rightCheek.y);
        const isCheekZone = dLeftCheek < regions.leftCheek.r || dRightCheek < regions.rightCheek.r;

        if (isCheekZone) {
          const cheekDist = Math.min(dLeftCheek, dRightCheek);
          const weight = 1.0 - cheekDist / regions.leftCheek.r;
          if (y > regions.leftCheek.y) {
            // Shadow under cheekbone
            const factor = 1.0 - cheekboneLift * 0.2 * weight;
            r *= factor;
            g *= factor;
            b *= factor;
          } else {
            // Highlight cheekbone crest
            const lift = cheekboneLift * 18 * weight;
            r = Math.min(255, r + lift);
            g = Math.min(255, g + lift * 0.9);
            b = Math.min(255, b + lift * 0.8);
          }
        }
      }

      // C. Neck Shadow Lift (prevents dark mud under chin)
      if (neckShadowLift > 0 && y > regions.jawline.y + regions.jawline.h * 0.6 && lum < 0.4) {
        const lift = neckShadowLift * 30 * (0.4 - lum);
        r = Math.min(255, r + lift);
        g = Math.min(255, g + lift);
        b = Math.min(255, b + lift);
      }

      // -------------------------------------------------------------
      // 5. SKIN TEXTURE (Pore Smoothing, Glow & Anti-Glare)
      // -------------------------------------------------------------
      const isSkinPixel = r > 60 && g > 40 && b > 25 && r > g && g > b && r - g >= 10;
      if (isSkinPixel) {
        // A. Anti-Glare / Matte Finish (fixes oily flash reflection on forehead/nose)
        if (antiGlare > 0 && lum > 0.82) {
          const matteFactor = antiGlare * 0.65;
          r = Math.round(r * (1 - matteFactor * 0.2));
          g = Math.round(g * (1 - matteFactor * 0.2));
          b = Math.round(b * (1 - matteFactor * 0.15));
        }

        // B. Skin Radiance & Melanin Glow
        if (skinGlow > 0 && lum > 0.3 && lum < 0.8) {
          r = Math.min(255, r + skinGlow * 14);
          g = Math.min(255, g + skinGlow * 5);
          b = Math.max(0, b - skinGlow * 8);
        }
      }

      // -------------------------------------------------------------
      // 6. EARS & HAIRLINE
      // -------------------------------------------------------------
      if (earDefine > 0) {
        const isEarZone =
          (x >= regions.leftEar.x &&
            x <= regions.leftEar.x + regions.leftEar.w &&
            y >= regions.leftEar.y &&
            y <= regions.leftEar.y + regions.leftEar.h) ||
          (x >= regions.rightEar.x &&
            x <= regions.rightEar.x + regions.rightEar.w &&
            y >= regions.rightEar.y &&
            y <= regions.rightEar.y + regions.rightEar.h);

        if (isEarZone && (lum < 0.35 || lum > 0.65)) {
          r = lum < 0.35 ? r * (1 - earDefine * 0.2) : Math.min(255, r * (1 + earDefine * 0.12));
          g = lum < 0.35 ? g * (1 - earDefine * 0.2) : Math.min(255, g * (1 + earDefine * 0.12));
          b = lum < 0.35 ? b * (1 - earDefine * 0.2) : Math.min(255, b * (1 + earDefine * 0.12));
        }
      }

      // Final clamping
      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Pore-level selective skin smoothing (preserves eyes, lips, nose edge)
  if (skinSmoothing > 0.05) {
    applySelectiveSkinSmoothing(ctx, width, height, skinSmoothing, regions);
  }
}

/**
 * Selective skin pore smoothing that avoids blurring eyes, lips, nostrils, and hair
 */
function applySelectiveSkinSmoothing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number,
  regions: FaceRegionEstimates
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const copy = new Uint8ClampedArray(src);

  const radius = Math.max(1, Math.min(3, Math.round(strength * 2.5)));
  const intensity = Math.min(0.7, strength * 0.65);
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      // Skip if inside eyes or mouth
      if (
        dist(x, y, regions.leftEye.x, regions.leftEye.y) < regions.leftEye.r * 1.1 ||
        dist(x, y, regions.rightEye.x, regions.rightEye.y) < regions.rightEye.r * 1.1 ||
        (x >= regions.mouth.x &&
          x <= regions.mouth.x + regions.mouth.w &&
          y >= regions.mouth.y &&
          y <= regions.mouth.y + regions.mouth.h)
      ) {
        continue;
      }

      const idx = (y * width + x) * 4;
      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];

      const isSkin = r > 65 && g > 45 && b > 25 && r > g && g > b && r - g >= 8;
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

          // Bilateral edge threshold
          if (
            Math.abs(nr - r) < 22 &&
            Math.abs(ng - g) < 22 &&
            Math.abs(nb - b) < 22
          ) {
            sumR += nr;
            sumG += ng;
            sumB += nb;
            count++;
          }
        }
      }

      if (count > 1) {
        src[idx] = Math.round(r * (1 - intensity) + (sumR / count) * intensity);
        src[idx + 1] = Math.round(g * (1 - intensity) + (sumG / count) * intensity);
        src[idx + 2] = Math.round(b * (1 - intensity) + (sumB / count) * intensity);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
