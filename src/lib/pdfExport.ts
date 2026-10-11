import { jsPDF } from 'jspdf';
import { SheetLayoutResult } from './sheetLayout';

export interface PdfExportOptions {
  layout: SheetLayoutResult;
  photoDataUrl: string;
  showBorders?: boolean;
  borderColor?: string;
  borderWidthMm?: number;
  showCutMarks?: boolean;
  title?: string;
}

/**
 * Creates a physical millimeter-accurate PDF document using jsPDF
 */
export async function generatePrintPdf(options: PdfExportOptions): Promise<jsPDF> {
  const {
    layout,
    photoDataUrl,
    showBorders = false,
    borderColor = '#9CA3AF',
    borderWidthMm = 0.2,
    showCutMarks = true,
  } = options;

  const pdf = new jsPDF({
    orientation: layout.paperWidthMm > layout.paperHeightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [layout.paperWidthMm, layout.paperHeightMm],
    compress: true,
  });

  // 1. Draw photos
  for (const slot of layout.slots) {
    pdf.addImage(
      photoDataUrl,
      'JPEG',
      slot.xMm,
      slot.yMm,
      slot.widthMm,
      slot.heightMm,
      undefined,
      'FAST'
    );

    // Optional border around photo
    if (showBorders && borderWidthMm > 0) {
      pdf.setDrawColor(borderColor);
      pdf.setLineWidth(borderWidthMm);
      pdf.rect(slot.xMm, slot.yMm, slot.widthMm, slot.heightMm, 'S');
    }
  }

  // 2. Draw cut marks
  if (showCutMarks && layout.cutMarks.length > 0) {
    pdf.setDrawColor('#6B7280'); // neutral gray
    pdf.setLineWidth(0.15);
    for (const mark of layout.cutMarks) {
      pdf.line(mark.x1, mark.y1, mark.x2, mark.y2);
    }
  }

  return pdf;
}

/**
 * Downloads generated PDF directly with custom filename
 */
export async function downloadPrintPdf(options: PdfExportOptions, filename: string = 'passport-print-sheet.pdf') {
  const pdf = await generatePrintPdf(options);
  pdf.save(filename);
}
