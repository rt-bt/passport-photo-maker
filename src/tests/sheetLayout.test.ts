import { describe, it, expect } from 'vitest';
import { calculateSheetLayout } from '../lib/sheetLayout';

describe('Sheet Grid Layout Calculator', () => {
  it('calculates maximum 35x45mm photos that fit on standard A4 (210x297mm)', () => {
    const result = calculateSheetLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      photoWidthMm: 35,
      photoHeightMm: 45,
      orientation: 'portrait',
      marginMm: 10,
      gapMm: 3,
      fillSheet: true,
    });

    // Printable: W = 210 - 20 = 190. Cols = floor((190+3)/(35+3)) = floor(193/38) = 5
    // Printable: H = 297 - 20 = 277. Rows = floor((277+3)/(45+3)) = floor(280/48) = 5
    // Max photos = 5 * 5 = 25
    expect(result.cols).toBe(5);
    expect(result.rows).toBe(5);
    expect(result.maxPhotos).toBe(25);
    expect(result.activeCount).toBe(25);
    expect(result.slots.length).toBe(25);
  });

  it('calculates 2x2 inch (51x51mm) photos on 4x6 inch (101.6x152.4mm) photo paper', () => {
    const result = calculateSheetLayout({
      paperWidthMm: 101.6,
      paperHeightMm: 152.4,
      photoWidthMm: 51,
      photoHeightMm: 51,
      orientation: 'landscape', // 152.4 x 101.6
      marginMm: 5,
      gapMm: 2,
      fillSheet: true,
    });

    // Landscape: W = 152.4, H = 101.6
    // Printable: W = 152.4 - 10 = 142.4. Cols = floor((142.4 + 2)/(53)) = 2
    // Printable: H = 101.6 - 10 = 91.6. Rows = floor((91.6 + 2)/(53)) = 1
    expect(result.cols).toBeGreaterThanOrEqual(1);
    expect(result.slots.length).toBe(result.maxPhotos);
  });

  it('respects exact copy count when not filling full sheet', () => {
    const result = calculateSheetLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      photoWidthMm: 35,
      photoHeightMm: 45,
      marginMm: 10,
      gapMm: 3,
      copies: 8,
      fillSheet: false,
    });

    expect(result.maxPhotos).toBe(25);
    expect(result.activeCount).toBe(8);
    expect(result.slots.length).toBe(8);
  });

  it('generates 8 cut marks per photo slot when enabled', () => {
    const result = calculateSheetLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      photoWidthMm: 35,
      photoHeightMm: 45,
      copies: 2,
      showCutMarks: true,
    });

    // 2 slots * 8 marks per slot = 16 marks
    expect(result.cutMarks.length).toBe(16);
  });

  it('ensures all photo slots stay strictly within paper bounds', () => {
    const result = calculateSheetLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      photoWidthMm: 35,
      photoHeightMm: 45,
      marginMm: 10,
      gapMm: 3,
      fillSheet: true,
    });

    for (const slot of result.slots) {
      expect(slot.xMm).toBeGreaterThanOrEqual(10);
      expect(slot.yMm).toBeGreaterThanOrEqual(10);
      expect(slot.xMm + slot.widthMm).toBeLessThanOrEqual(200.01);
      expect(slot.yMm + slot.heightMm).toBeLessThanOrEqual(287.01);
    }
  });
});
