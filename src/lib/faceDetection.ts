import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';
import { DetectedFace, ComplianceWarning, PassportPreset } from '../types';

let faceDetectorInstance: FaceDetector | null = null;
let isInitializing = false;

/**
 * Initializes MediaPipe FaceDetector singleton
 */
export async function getFaceDetector(): Promise<FaceDetector> {
  if (faceDetectorInstance) return faceDetectorInstance;
  if (isInitializing) {
    // Wait for in-flight initialization
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (faceDetectorInstance) return faceDetectorInstance;
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    faceDetectorInstance = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5,
    });
    return faceDetectorInstance;
  } finally {
    isInitializing = false;
  }
}

/**
 * Detects faces in an image or canvas element
 */
export async function detectFacesInImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<DetectedFace[]> {
  try {
    const detector = await getFaceDetector();
    const result = detector.detect(imageElement);

    if (!result.detections || result.detections.length === 0) {
      return [];
    }

    return result.detections.map((detection) => {
      const box = detection.boundingBox || {
        originX: 0,
        originY: 0,
        width: 0,
        height: 0,
      };

      const keypoints = detection.keypoints || [];
      const leftEye = keypoints[0] ? { x: keypoints[0].x, y: keypoints[0].y } : undefined;
      const rightEye = keypoints[1] ? { x: keypoints[1].x, y: keypoints[1].y } : undefined;
      const nose = keypoints[2] ? { x: keypoints[2].x, y: keypoints[2].y } : undefined;
      const mouth = keypoints[3] ? { x: keypoints[3].x, y: keypoints[3].y } : undefined;

      return {
        box: {
          x: box.originX,
          y: box.originY,
          width: box.width,
          height: box.height,
        },
        confidence: detection.categories[0]?.score || 0.8,
        landmarks: { leftEye, rightEye, nose, mouth },
      };
    });
  } catch (err) {
    console.warn('Face detection unavailable or failed, using heuristic fallback', err);
    return [];
  }
}

/**
 * Computes compliance checklist warnings based on face detection and preset
 */
export function evaluateFaceCompliance(
  faces: DetectedFace[],
  cropArea: { x: number; y: number; width: number; height: number },
  preset: PassportPreset
): ComplianceWarning[] {
  const warnings: ComplianceWarning[] = [];

  if (faces.length === 0) {
    warnings.push({
      id: 'no-face',
      type: 'no_face',
      message: 'No face detected in crop area. Ensure your face is clearly visible.',
      severity: 'warning',
    });
    return warnings;
  }

  if (faces.length > 1) {
    warnings.push({
      id: 'multiple-faces',
      type: 'multiple_faces',
      message: `${faces.length} faces detected. Passport photos must only contain one person.`,
      severity: 'error',
    });
  }

  const primaryFace = faces[0];
  // Calculate head height percentage inside the cropped area
  // Bounding box typically covers forehead to chin; total head is ~1.2x bounding box height
  const estimatedHeadHeight = primaryFace.box.height * 1.15;
  const headRatioPercent = (estimatedHeadHeight / cropArea.height) * 100;

  if (headRatioPercent < preset.headHeightMinPercent - 10) {
    warnings.push({
      id: 'head-too-small',
      type: 'head_too_small',
      message: `Face appears too small (${Math.round(headRatioPercent)}% vs required ${preset.headHeightMinPercent}-${preset.headHeightMaxPercent}%). Zoom in.`,
      severity: 'warning',
    });
  } else if (headRatioPercent > preset.headHeightMaxPercent + 10) {
    warnings.push({
      id: 'head-too-large',
      type: 'head_too_large',
      message: `Face appears too close (${Math.round(headRatioPercent)}% vs required ${preset.headHeightMinPercent}-${preset.headHeightMaxPercent}%). Zoom out.`,
      severity: 'warning',
    });
  }

  // Check horizontal centering
  const faceCenterX = primaryFace.box.x + primaryFace.box.width / 2;
  const cropCenterX = cropArea.x + cropArea.width / 2;
  const horizontalOffsetPercent = Math.abs((faceCenterX - cropCenterX) / cropArea.width) * 100;

  if (horizontalOffsetPercent > 12) {
    warnings.push({
      id: 'off-center',
      type: 'off_center',
      message: 'Face is not centered horizontally. Move the photo closer to center.',
      severity: 'info',
    });
  }

  return warnings;
}

/**
 * Calculates optimal crop position and zoom to auto-center face for the preset
 */
export function calculateAutoCrop(
  face: DetectedFace,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
): { x: number; y: number; zoom: number } {
  const faceCenterY = face.box.y + face.box.height * 0.45;

  // We want head height to be ~72% of crop height
  const idealCropHeight = (face.box.height * 1.2) / 0.72;
  const idealCropWidth = idealCropHeight * aspectRatio;

  // Zoom relative to image
  const zoom = Math.max(1, Math.min(3, imageHeight / idealCropHeight));

  // Offset
  const x = 0; // centered in react-easy-crop coordinates
  const y = ((imageHeight / 2 - faceCenterY) / imageHeight) * 100;

  return { x, y, zoom };
}
