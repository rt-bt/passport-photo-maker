import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf' | 'svg';
  multiplier?: number; // e.g. 2x, 3x for high-res / 300 DPI
  quality?: number; // 0 to 1 for JPEG
  pageSize?: 'a4' | 'a3' | 'a5' | 'letter' | 'custom';
  orientation?: 'portrait' | 'landscape';
  includeBleed?: boolean;
  includeCropMarks?: boolean;
}

/**
 * Download a data URL or Blob as a file
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Fabric canvas as high-resolution PNG or JPEG
 */
export function exportCanvasAsImage(
  fabricCanvas: any,
  options: { format: 'png' | 'jpeg'; multiplier?: number; quality?: number; filename?: string }
): string {
  if (!fabricCanvas) return '';

  const multiplier = options.multiplier || 2; // Default 2x for HD, 3x for 300 DPI
  const format = options.format === 'jpeg' ? 'jpeg' : 'png';
  const quality = options.quality ?? 0.95;

  const dataUrl = fabricCanvas.toDataURL({
    format,
    multiplier,
    quality,
  });

  if (options.filename) {
    downloadFile(dataUrl, `${options.filename}.${format === 'jpeg' ? 'jpg' : 'png'}`);
  }

  return dataUrl;
}

/**
 * Export Fabric canvas as standard SVG vector
 */
export function exportCanvasAsSVG(fabricCanvas: any, filename?: string): string {
  if (!fabricCanvas) return '';
  const svg = fabricCanvas.toSVG();

  if (filename) {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${filename}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return svg;
}

/**
 * Export design to crisp PDF using jsPDF
 */
export async function exportCanvasAsPDF(
  fabricCanvas: any,
  options: {
    filename?: string;
    multiplier?: number;
    dpi?: number;
    includeCropMarks?: boolean;
  } = {}
) {
  if (!fabricCanvas) return;

  const widthPx = fabricCanvas.getWidth();
  const heightPx = fabricCanvas.getHeight();
  const orientation = widthPx > heightPx ? 'landscape' : 'portrait';

  // Render high resolution raster for PDF
  const multiplier = options.multiplier || (options.dpi === 300 ? 3.125 : 2);
  const imgData = fabricCanvas.toDataURL({
    format: 'jpeg',
    multiplier,
    quality: 0.98,
  });

  // Calculate PDF dimensions in mm (1 inch = 25.4 mm, 72 pt/in for standard pdf)
  const pxToMm = 25.4 / 96; // Standard screen CSS 96 DPI
  const pdfWidthMm = widthPx * pxToMm;
  const pdfHeightMm = heightPx * pxToMm;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm],
  });

  doc.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');

  // Add optional print crop marks at corners
  if (options.includeCropMarks) {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    const m = 5; // 5mm margin
    // Top-left
    doc.line(m, 0, m, 4);
    doc.line(0, m, 4, m);
    // Top-right
    doc.line(pdfWidthMm - m, 0, pdfWidthMm - m, 4);
    doc.line(pdfWidthMm, m, pdfWidthMm - 4, m);
    // Bottom-left
    doc.line(m, pdfHeightMm, m, pdfHeightMm - 4);
    doc.line(0, pdfHeightMm - m, 4, pdfHeightMm - m);
    // Bottom-right
    doc.line(pdfWidthMm - m, pdfHeightMm, pdfWidthMm - m, pdfHeightMm - 4);
    doc.line(pdfWidthMm, pdfHeightMm - m, pdfWidthMm - 4, pdfHeightMm - m);
  }

  const filename = options.filename ? `${options.filename}.pdf` : 'indian-design-export.pdf';
  doc.save(filename);
}

/**
 * Generate A4 Grid PDF for Batch ID Cards (e.g. 10 cards per A4 page: 2 cols x 5 rows)
 */
export async function generateA4BatchIDPDF(
  cardsDataUrls: string[],
  options: { title?: string; includeCropMarks?: boolean } = {}
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210mm x 297mm
  });

  const cardWidthMm = 85.6; // Standard CR80 width in mm (3.37 inch)
  const cardHeightMm = 54.0; // Standard CR80 height in mm (2.125 inch)
  const marginLeft = 15;
  const marginTop = 12;
  const gapX = 9;
  const gapY = 3;
  const cardsPerPage = 10; // 2 columns x 5 rows

  for (let i = 0; i < cardsDataUrls.length; i++) {
    if (i > 0 && i % cardsPerPage === 0) {
      doc.addPage();
    }

    const indexOnPage = i % cardsPerPage;
    const col = indexOnPage % 2;
    const row = Math.floor(indexOnPage / 2);

    const x = marginLeft + col * (cardWidthMm + gapX);
    const y = marginTop + row * (cardHeightMm + gapY);

    doc.addImage(cardsDataUrls[i], 'JPEG', x, y, cardWidthMm, cardHeightMm);

    // Draw thin cutting border or crop marks
    if (options.includeCropMarks) {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.15);
      doc.rect(x, y, cardWidthMm, cardHeightMm, 'S');
    }
  }

  doc.save(options.title ? `${options.title}.pdf` : 'Batch_ID_Cards_A4_Print.pdf');
}

/**
 * Generate A4 Sheet Passport Photo Grid (e.g., 8, 16, or 32 passport photos with cut lines)
 */
export async function generatePassportPhotoSheet(
  photoDataUrl: string,
  count: 8 | 16 | 32 = 16,
  options: { filename?: string } = {}
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Standard Indian Passport size: 35mm x 45mm
  const photoW = 35;
  const photoH = 45;

  let cols = 4;
  let rows = Math.ceil(count / cols);
  if (count === 8) {
    cols = 4;
    rows = 2;
  } else if (count === 32) {
    cols = 5;
    rows = 7;
  }

  const startX = (210 - cols * (photoW + 6)) / 2;
  const startY = 25;

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Indian Passport Photo Print Sheet (35mm x 45mm)', 105, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Ready to print on 4x6" or A4 Glossy Photo Paper. Cut along the dashed guide lines.', 105, 20, { align: 'center' });

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (photoW + 6);
    const y = startY + row * (photoH + 6);

    // Add Photo
    doc.addImage(photoDataUrl, 'JPEG', x, y, photoW, photoH);

    // Add delicate border & cut marks
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(x, y, photoW, photoH, 'S');
  }

  doc.save(options.filename || `Passport_Photos_${count}_A4_Sheet.pdf`);
}
