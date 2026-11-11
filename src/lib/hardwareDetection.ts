/**
 * Client-side Hardware & GPU Detection Utility
 * Uses modern WebGPU and WebGL2 hardware queries to automatically detect the user's physical GPU
 * directly inside the browser (Vercel, GitHub Pages, or Localhost) without requiring any backend.
 */

export interface ClientHardwareInfo {
  gpuName: string;
  vendor: string;
  isDedicated: boolean;
  webgpuSupported: boolean;
  webglSupported: boolean;
  performanceTier: 'ultra' | 'high' | 'medium' | 'basic';
  summary: string;
}

function cleanGpuName(raw: string): string {
  if (!raw) return 'System GPU';

  // 1. ANGLE pattern: ANGLE (Vendor, GPU_NAME (0x...) Direct3D..., ...)
  const angleMatch = raw.match(
    /ANGLE\s*\([^,]+,\s*([^,]+?)(?:\s+\(0x[0-9a-fA-F]+\))?(?:\s+(?:Direct3D|vs_\d|D3D\d|OpenGL|\(R\)|\(TM\))).*?\)/i
  );
  if (angleMatch && angleMatch[1]) {
    return angleMatch[1]
      .replace(/\(R\)|\(TM\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 2. Direct vendor strings: NVIDIA, AMD, Intel, Apple
  const directMatch = raw.match(
    /(?:NVIDIA\s+GeForce\s+[a-zA-Z0-9\s]+?(?=(?:Direct3D|\(0x|vs_\d|,|\)))|AMD\s+Radeon[a-zA-Z0-9\s()]+?(?=(?:Direct3D|\(0x|vs_\d|,|\)))|Intel[a-zA-Z0-9\s()]+?(?=(?:Direct3D|\(0x|vs_\d|,|\)))|Apple\s+M\d[a-zA-Z0-9\s]*)/i
  );
  if (directMatch && directMatch[0]) {
    return directMatch[0]
      .replace(/\(R\)|\(TM\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 3. Clean generic ANGLE or parenthesis wrapper
  const stripped = raw.replace(/ANGLE\s*\(|\)/gi, '').trim();
  const parts = stripped.split(',');
  if (parts.length > 1 && parts[1].trim()) {
    return parts[1]
      .replace(/\(R\)|\(TM\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return stripped;
}

let cachedHardwareInfo: ClientHardwareInfo | null = null;

/**
 * Automatically inspects the browser's physical GPU adapter using WebGPU and WebGL2.
 */
export async function detectClientHardware(): Promise<ClientHardwareInfo> {
  if (cachedHardwareInfo) {
    return cachedHardwareInfo;
  }

  let gpuName = 'System Hardware';
  let vendor = 'Generic';
  let isDedicated = false;
  let webgpuSupported = false;
  let webglSupported = false;

  // 1. Try WebGPU (Modern Chromium, Edge, Opera, Safari 18+)
  if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter({
        powerPreference: 'high-performance',
      });
      if (adapter) {
        webgpuSupported = true;
        const info = (adapter as any).info || (await (adapter as any).requestAdapterInfo?.());
        if (info) {
          if (info.description) {
            gpuName = cleanGpuName(info.description);
          } else if (info.device) {
            gpuName = cleanGpuName(info.device);
          } else if (info.architecture) {
            gpuName = `${info.vendor ? info.vendor.toUpperCase() + ' ' : ''}${info.architecture}`;
          }
          if (info.vendor) vendor = info.vendor;
        }
      }
    } catch {
      // WebGPU adapter request failed; proceed to WebGL
    }
  }

  // 2. Query WebGL2 / WebGL debug renderer info (extremely detailed on Windows/macOS/Linux)
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

      if (gl) {
        webglSupported = true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          if (unmaskedRenderer && (gpuName === 'System Hardware' || gpuName.length < 5)) {
            gpuName = cleanGpuName(unmaskedRenderer);
          }
          if (unmaskedVendor && vendor === 'Generic') {
            vendor = unmaskedVendor;
          }
        }
      }
    } catch {
      // Canvas WebGL unavailable
    }
  }

  // Determine if dedicated high-performance GPU
  const lower = gpuName.toLowerCase();
  isDedicated =
    /rtx|gtx|geforce|radeon|rx\s*\d|apple\s*m\d|dedicated|discrete|quadro|titan|arc\s*a\d/i.test(
      lower
    );

  let performanceTier: ClientHardwareInfo['performanceTier'] = 'basic';
  if (/rtx\s*40|rtx\s*30|rx\s*7\d|rx\s*6\d|apple\s*m[234]\s*(?:pro|max|ultra)/i.test(lower)) {
    performanceTier = 'ultra';
  } else if (/rtx|gtx\s*16|apple\s*m\d|arc/i.test(lower) || isDedicated) {
    performanceTier = 'high';
  } else if (/iris|vega|radeon|uhd/i.test(lower)) {
    performanceTier = 'medium';
  }

  const summary = webgpuSupported
    ? `${gpuName} (WebGPU Accelerated)`
    : webglSupported
    ? `${gpuName} (WebGL2 Accelerated)`
    : gpuName;

  cachedHardwareInfo = {
    gpuName,
    vendor,
    isDedicated,
    webgpuSupported,
    webglSupported,
    performanceTier,
    summary,
  };

  return cachedHardwareInfo;
}
