import { describe, it, expect } from 'vitest';
import { mmToPx, pxToMm, inchToPx, pxToInch, toMm, formatBytes } from '../lib/units';

describe('Units & Dimension Math', () => {
  it('converts 35x45 mm to pixels at 300 DPI accurately', () => {
    // 35mm / 25.4 * 300 = 413.385 -> 413 px
    expect(mmToPx(35, 300)).toBe(413);
    // 45mm / 25.4 * 300 = 531.496 -> 531 px
    expect(mmToPx(45, 300)).toBe(531);
  });

  it('converts 2x2 inch to pixels at 300 DPI', () => {
    expect(inchToPx(2, 300)).toBe(600);
  });

  it('converts pixels back to mm at 300 DPI', () => {
    const mm = pxToMm(413, 300);
    expect(mm).toBeCloseTo(34.97, 1);
  });

  it('converts pixels back to inches at 300 DPI', () => {
    const inch = pxToInch(600, 300);
    expect(inch).toBe(2);
  });

  it('handles arbitrary unit conversions to mm', () => {
    expect(toMm(5, 'cm')).toBe(50);
    expect(toMm(2, 'inch')).toBeCloseTo(50.8, 1);
    expect(toMm(413, 'px', 300)).toBeCloseTo(35, 0);
  });

  it('formats byte strings cleanly', () => {
    expect(formatBytes(0)).toBe('0 KB');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(51200)).toBe('50.0 KB');
    expect(formatBytes(2097152)).toBe('2.0 MB');
  });
});
