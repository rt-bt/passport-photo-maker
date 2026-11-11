import { GpuServerStatus, GpuRestoreOptions, GpuRestoreResult } from '../types';

export function getGpuServerUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('gpu_server_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = (import.meta as any).env?.VITE_GPU_SERVER_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000';
}

export function setGpuServerUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('gpu_server_url', url.trim());
    } else {
      localStorage.removeItem('gpu_server_url');
    }
    cachedStatus = null;
  }
}

export const DEFAULT_GPU_SERVER_URL = getGpuServerUrl();

let cachedStatus: { status: GpuServerStatus; timestamp: number } | null = null;

/**
 * Checks the status and connectivity of the local or cloud GPU AI engine
 */
export async function checkGpuServerHealth(
  serverUrl = getGpuServerUrl(),
  forceRefresh = false
): Promise<GpuServerStatus> {
  const now = Date.now();
  if (!forceRefresh && cachedStatus && now - cachedStatus.timestamp < 3000) {
    return cachedStatus.status;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${serverUrl}/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const status: GpuServerStatus = {
        online: true,
        gpuName: data.gpu_name || 'AI GPU Accelerator',
        vramFreeMb: data.vram_free_mb,
        vramTotalMb: data.vram_total_mb,
        cudaAvailable: data.cuda_available ?? true,
        performanceProfile: data.performance_profile,
        modelsLoaded: data.models_loaded || ['GFPGANv1.4', 'RealESRGAN'],
        version: data.version || '1.0.0',
      };
      cachedStatus = { status, timestamp: now };
      return status;
    }
  } catch {
    // Server is unreachable / offline
  }

  const offlineStatus: GpuServerStatus = {
    online: false,
    cudaAvailable: false,
  };
  cachedStatus = { status: offlineStatus, timestamp: now };
  return offlineStatus;
}

/**
 * Restores and upscales a low quality image using the local RTX 4080 GPU engine
 */
export async function restoreImageWithGpu(
  imageDataUrl: string,
  options: GpuRestoreOptions,
  serverUrl = getGpuServerUrl()
): Promise<GpuRestoreResult> {
  const payload = {
    image: imageDataUrl,
    upscale: options.upscale || 4,
    target_res: options.targetRes || 'original',
    face_restore: options.faceRestore,
    fidelity: options.fidelity,
    deblock: options.deblock ?? 40,
    depth_shading: options.depthShading ?? 40,
    brightness_balance: options.brightnessBalance ?? 0,
    hdr_contrast: options.hdrContrast ?? 35,
    color_warmth: options.colorWarmth ?? 15,
    eye_clarity: options.eyeClarity ?? 30,
    denoise: options.denoise ?? 20,
    sharpen: options.sharpen ?? 30,
    output_format: options.outputFormat || 'jpeg',
  };

  const res = await fetch(`${serverUrl}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errMsg = `GPU Server Error (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errMsg = errJson.detail;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  return {
    success: true,
    dataUrl: data.image,
    processingTimeMs: data.processing_time_ms,
    originalWidth: data.original_width,
    originalHeight: data.original_height,
    enhancedWidth: data.enhanced_width,
    enhancedHeight: data.enhanced_height,
    targetRes: data.target_res || options.targetRes || 'original',
    facesDetected: data.faces_detected,
    gpuUsed: data.gpu_used || 'AI GPU',
    performanceProfile: data.performance_profile,
  };
}
