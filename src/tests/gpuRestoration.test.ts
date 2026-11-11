import { describe, it, expect, vi } from 'vitest';
import { checkGpuServerHealth, DEFAULT_GPU_SERVER_URL } from '../lib/gpuRestoration';

describe('GPU Restoration Service', () => {
  it('returns offline status when server is unreachable', async () => {
    // Attempt fetch with non-existent port
    const status = await checkGpuServerHealth('http://127.0.0.1:9999', true);
    expect(status.online).toBe(false);
    expect(status.cudaAvailable).toBe(false);
  });

  it('correctly handles online status response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'online',
        gpu_name: 'NVIDIA GeForce RTX 4080 Laptop GPU',
        vram_free_mb: 11000,
        vram_total_mb: 12282,
        cuda_available: true,
        models_loaded: ['RealESRGAN_Compact', 'YuNet_FaceDetector'],
        version: '1.0.0',
      }),
    } as any);

    const status = await checkGpuServerHealth(DEFAULT_GPU_SERVER_URL, true);
    expect(status.online).toBe(true);
    expect(status.gpuName).toContain('RTX 4080');
    expect(status.cudaAvailable).toBe(true);
  });
});
