import { DimensionUnit } from '../types';

export const MM_PER_INCH = 25.4;
export const CM_PER_INCH = 2.54;

/**
 * Convert millimeters to pixels at a given DPI
 */
export function mmToPx(mm: number, dpi: number = 300): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

/**
 * Convert pixels to millimeters at a given DPI
 */
export function pxToMm(px: number, dpi: number = 300): number {
  return Number(((px / dpi) * MM_PER_INCH).toFixed(2));
}

/**
 * Convert inches to pixels at a given DPI
 */
export function inchToPx(inch: number, dpi: number = 300): number {
  return Math.round(inch * dpi);
}

/**
 * Convert pixels to inches at a given DPI
 */
export function pxToInch(px: number, dpi: number = 300): number {
  return Number((px / dpi).toFixed(3));
}

/**
 * Convert any unit (mm, cm, inch, px) to millimeters
 */
export function toMm(val: number, unit: DimensionUnit, dpi: number = 300): number {
  switch (unit) {
    case 'mm':
      return val;
    case 'cm':
      return val * 10;
    case 'inch':
      return val * MM_PER_INCH;
    case 'px':
      return pxToMm(val, dpi);
    default:
      return val;
  }
}

/**
 * Format bytes into readable KB / MB
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  if (bytes < k) {
    return `${bytes} B`;
  }
  if (bytes < k * k) {
    return `${(bytes / k).toFixed(dm)} KB`;
  }
  return `${(bytes / (k * k)).toFixed(dm)} MB`;
}

/**
 * Format dimension string e.g. "35 × 45 mm (413 × 531 px at 300 DPI)"
 */
export function formatDimensions(widthMm: number, heightMm: number, dpi: number = 300): string {
  const wPx = mmToPx(widthMm, dpi);
  const hPx = mmToPx(heightMm, dpi);
  const wInch = (widthMm / MM_PER_INCH).toFixed(2);
  const hInch = (heightMm / MM_PER_INCH).toFixed(2);
  return `${widthMm}×${heightMm} mm / ${wInch}×${hInch} in (${wPx}×${hPx} px)`;
}
