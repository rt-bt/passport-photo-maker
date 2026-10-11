import heic2any from 'heic2any';

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
}

/**
 * Loads and preprocesses an uploaded file (JPG, PNG, WEBP, HEIC):
 * 1. Converts HEIC to JPEG if needed
 * 2. Downscales if exceeding maxDimension (default 3500px)
 * 3. Auto-normalizes EXIF rotation
 */
export async function processUploadedFile(
  file: File,
  maxDimension: number = 3500
): Promise<ProcessedImageResult> {
  const originalSizeBytes = file.size;
  let workingBlob: Blob = file;

  // Handle HEIC / HEIF files from Apple devices
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (isHeic) {
    try {
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.95,
      });
      workingBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (err) {
      console.warn('HEIC conversion failed, attempting raw load', err);
    }
  }

  // Load into an HTMLImageElement
  const objectUrl = URL.createObjectURL(workingBlob);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(new Error('Failed to load image file'));
    image.src = objectUrl;
  });

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Check if downscale is required
  let scale = 1.0;
  if (width > maxDimension || height > maxDimension) {
    scale = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Draw onto canvas to bake in orientation and downscaled dimensions
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Canvas 2D context not available');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  URL.revokeObjectURL(objectUrl);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

  return {
    dataUrl,
    width,
    height,
    originalSizeBytes,
  };
}
