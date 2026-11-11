import { describe, it, expect, vi } from 'vitest';
import {
  SKIN_TONE_PALETTES,
  CLOTHING_PALETTES,
  BACKGROUND_PALETTES,
  EYE_PALETTES,
  isImageGrayscaleOrSepia,
  colorizeGrayscalePortrait,
  colorizeGrayscaleImage,
  detectEyeMacro,
} from '../lib/colorization';
import { estimateFacialRegions } from '../lib/faceRetouch';

describe('B&W to Color Photo Colorization Service', () => {
  it('correctly provides preset color palettes for skin, clothing, eye, and background', () => {
    expect(SKIN_TONE_PALETTES.wheatish).toBeDefined();
    expect(SKIN_TONE_PALETTES.wheatish.r).toBeGreaterThan(SKIN_TONE_PALETTES.wheatish.b);

    expect(CLOTHING_PALETTES.navy).toBeDefined();
    expect(CLOTHING_PALETTES.navy.b).toBeGreaterThan(CLOTHING_PALETTES.navy.r);

    expect(BACKGROUND_PALETTES.studio_blue).toBeDefined();
    expect(BACKGROUND_PALETTES.original).toBeDefined();

    expect(EYE_PALETTES.hazel).toBeDefined();
    expect(EYE_PALETTES.blue).toBeDefined();
    expect(EYE_PALETTES.green).toBeDefined();
  });

  it('detects grayscale canvas accurately using mock context', () => {
    const mockData = new Uint8ClampedArray(400); // 10x10 gray pixels
    for (let i = 0; i < mockData.length; i += 4) {
      mockData[i] = 120;
      mockData[i + 1] = 120;
      mockData[i + 2] = 120;
      mockData[i + 3] = 255;
    }

    const mockCtx = {
      getImageData: vi.fn(() => ({ data: mockData })),
    } as unknown as CanvasRenderingContext2D;

    const isGray = isImageGrayscaleOrSepia(mockCtx, 10, 10);
    expect(isGray).toBe(true);

    // Now test colorful pixels (high variance)
    const colorData = new Uint8ClampedArray(400);
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i] = 255;
      colorData[i + 1] = 0;
      colorData[i + 2] = 50;
      colorData[i + 3] = 255;
    }
    const mockColorCtx = {
      getImageData: vi.fn(() => ({ data: colorData })),
    } as unknown as CanvasRenderingContext2D;

    const isColorGray = isImageGrayscaleOrSepia(mockColorCtx, 10, 10);
    expect(isColorGray).toBe(false);
  });

  it('colorizes grayscale portrait canvas without errors using mock context', () => {
    const mockData = new Uint8ClampedArray(400);
    for (let i = 0; i < mockData.length; i += 4) {
      mockData[i] = 128;
      mockData[i + 1] = 128;
      mockData[i + 2] = 128;
      mockData[i + 3] = 255;
    }

    const mockCtx = {
      getImageData: vi.fn(() => ({ data: mockData })),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const regions = estimateFacialRegions(10, 10);
    expect(() => {
      colorizeGrayscalePortrait(
        mockCtx,
        10,
        10,
        {
          enabled: true,
          skinTone: 'wheatish',
          clothingColor: 'navy',
          backgroundColor: 'studio_blue',
          eyeColor: 'hazel',
          vibrancy: 70,
          colorWarmth: 10,
        },
        regions
      );
    }).not.toThrow();

    expect(mockCtx.putImageData).toHaveBeenCalled();
  });

  it('runs master colorizeGrayscaleImage without errors for non-face images', () => {
    const mockData = new Uint8ClampedArray(400);
    for (let i = 0; i < mockData.length; i += 4) {
      mockData[i] = 140;
      mockData[i + 1] = 140;
      mockData[i + 2] = 140;
      mockData[i + 3] = 255;
    }

    const mockCtx = {
      getImageData: vi.fn(() => ({ data: mockData })),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    expect(() => {
      colorizeGrayscaleImage(
        mockCtx,
        10,
        10,
        {
          enabled: true,
          skinTone: 'wheatish',
          clothingColor: 'navy',
          backgroundColor: 'original',
          eyeColor: 'hazel',
          vibrancy: 75,
          colorWarmth: 15,
        }
      );
    }).not.toThrow();

    expect(mockCtx.putImageData).toHaveBeenCalled();
  });
});
