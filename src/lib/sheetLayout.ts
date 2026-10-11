export interface SheetLayoutResult {
  paperWidthMm: number;
  paperHeightMm: number;
  cols: number;
  rows: number;
  maxPhotos: number;
  activeCount: number;
  gridWidthMm: number;
  gridHeightMm: number;
  startX: number;
  startY: number;
  slots: Array<{
    col: number;
    row: number;
    xMm: number;
    yMm: number;
    widthMm: number;
    heightMm: number;
  }>;
  cutMarks: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
}

export interface CalculateSheetLayoutOptions {
  paperWidthMm: number;
  paperHeightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  gapMm?: number;
  copies?: number;
  fillSheet?: boolean;
  showCutMarks?: boolean;
  cutMarkLengthMm?: number;
}

/**
 * Calculates optimal grid layout for passport photos on a paper sheet
 */
export function calculateSheetLayout(options: CalculateSheetLayoutOptions): SheetLayoutResult {
  const {
    paperWidthMm: rawPaperWidth,
    paperHeightMm: rawPaperHeight,
    photoWidthMm,
    photoHeightMm,
    orientation = 'portrait',
    marginMm = 10,
    gapMm = 3,
    copies = 1,
    fillSheet = false,
    showCutMarks = true,
    cutMarkLengthMm = 2,
  } = options;

  // Resolve paper dimensions according to orientation
  let paperWidthMm = rawPaperWidth;
  let paperHeightMm = rawPaperHeight;
  if (orientation === 'landscape') {
    paperWidthMm = Math.max(rawPaperWidth, rawPaperHeight);
    paperHeightMm = Math.min(rawPaperWidth, rawPaperHeight);
  } else {
    paperWidthMm = Math.min(rawPaperWidth, rawPaperHeight);
    paperHeightMm = Math.max(rawPaperWidth, rawPaperHeight);
  }

  const printableWidth = Math.max(0, paperWidthMm - 2 * marginMm);
  const printableHeight = Math.max(0, paperHeightMm - 2 * marginMm);

  if (photoWidthMm <= 0 || photoHeightMm <= 0 || printableWidth < photoWidthMm || printableHeight < photoHeightMm) {
    return {
      paperWidthMm,
      paperHeightMm,
      cols: 0,
      rows: 0,
      maxPhotos: 0,
      activeCount: 0,
      gridWidthMm: 0,
      gridHeightMm: 0,
      startX: 0,
      startY: 0,
      slots: [],
      cutMarks: [],
    };
  }

  const cols = Math.floor((printableWidth + gapMm) / (photoWidthMm + gapMm));
  const rows = Math.floor((printableHeight + gapMm) / (photoHeightMm + gapMm));
  const maxPhotos = cols * rows;

  const activeCount = fillSheet ? maxPhotos : Math.min(Math.max(1, copies), maxPhotos);

  const gridWidthMm = cols > 0 ? cols * photoWidthMm + (cols - 1) * gapMm : 0;
  const gridHeightMm = rows > 0 ? rows * photoHeightMm + (rows - 1) * gapMm : 0;

  // Center the grid inside printable margin
  const startX = marginMm + (printableWidth - gridWidthMm) / 2;
  const startY = marginMm + (printableHeight - gridHeightMm) / 2;

  const slots: SheetLayoutResult['slots'] = [];
  let placed = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (placed < activeCount) {
        slots.push({
          col: c,
          row: r,
          xMm: startX + c * (photoWidthMm + gapMm),
          yMm: startY + r * (photoHeightMm + gapMm),
          widthMm: photoWidthMm,
          heightMm: photoHeightMm,
        });
        placed++;
      }
    }
  }

  // Generate corner cut marks for each slot
  const cutMarks: SheetLayoutResult['cutMarks'] = [];
  if (showCutMarks && cutMarkLengthMm > 0) {
    for (const slot of slots) {
      const { xMm, yMm, widthMm, heightMm } = slot;
      const xRight = xMm + widthMm;
      const yBottom = yMm + heightMm;

      // Top-Left corner marks
      cutMarks.push({ x1: xMm, y1: yMm - cutMarkLengthMm, x2: xMm, y2: yMm });
      cutMarks.push({ x1: xMm - cutMarkLengthMm, y1: yMm, x2: xMm, y2: yMm });

      // Top-Right corner marks
      cutMarks.push({ x1: xRight, y1: yMm - cutMarkLengthMm, x2: xRight, y2: yMm });
      cutMarks.push({ x1: xRight, y1: yMm, x2: xRight + cutMarkLengthMm, y2: yMm });

      // Bottom-Left corner marks
      cutMarks.push({ x1: xMm, y1: yBottom, x2: xMm, y2: yBottom + cutMarkLengthMm });
      cutMarks.push({ x1: xMm - cutMarkLengthMm, y1: yBottom, x2: xMm, y2: yBottom });

      // Bottom-Right corner marks
      cutMarks.push({ x1: xRight, y1: yBottom, x2: xRight, y2: yBottom + cutMarkLengthMm });
      cutMarks.push({ x1: xRight, y1: yBottom, x2: xRight + cutMarkLengthMm, y2: yBottom });
    }
  }

  return {
    paperWidthMm,
    paperHeightMm,
    cols,
    rows,
    maxPhotos,
    activeCount,
    gridWidthMm,
    gridHeightMm,
    startX,
    startY,
    slots,
    cutMarks,
  };
}
