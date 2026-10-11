export type DimensionUnit = 'mm' | 'cm' | 'inch' | 'px';

export interface PassportPreset {
  id: string;
  name: string;
  country: string;
  category: 'passport' | 'visa' | 'id' | 'other';
  widthMm: number;
  heightMm: number;
  headHeightMinPercent: number; // e.g. 70%
  headHeightMaxPercent: number; // e.g. 80%
  recommendedBgColor: string;
  description: string;
  complianceNotes: string[];
}

export interface PaperSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export interface PhotoAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  sharpness: number; // 0 to 100
  smoothness: number; // 0 to 100
  rotation: number; // 0, 90, 180, 270
  fineRotation: number; // -45 to 45
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface BackgroundSettings {
  mode: 'original' | 'solid' | 'gradient' | 'transparent';
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  featherRadius: number; // 0 to 10 px
}

export interface CompressionSettings {
  targetSizeKb: number | null; // e.g. 20, 50, 100, 200, or null
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  dpi: 150 | 300 | 600;
}

export interface SheetSettings {
  paperSizeId: string;
  orientation: 'portrait' | 'landscape';
  marginMm: number;
  gapMm: number;
  copies: number;
  fillSheet: boolean;
  showBorders: boolean;
  borderColor: string;
  borderWidthMm: number;
  showCutMarks: boolean;
}

export interface NameDateSettings {
  enabled: boolean;
  name: string;
  date: string;
  font: string;
  fontSize: number;
  bannerHeightMm: number;
  textColor: string;
  backgroundColor: string;
}

export interface SignatureSettings {
  enabled: boolean;
  dataUrl: string | null;
  widthMm: number;
  heightMm: number;
  threshold: number; // 0 to 255 for binarization
}

export interface DetectedFace {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  landmarks?: {
    leftEye?: { x: number; y: number };
    rightEye?: { x: number; y: number };
    nose?: { x: number; y: number };
    mouth?: { x: number; y: number };
  };
}

export interface ComplianceWarning {
  id: string;
  type: 'no_face' | 'multiple_faces' | 'head_too_small' | 'head_too_large' | 'off_center' | 'low_res';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
