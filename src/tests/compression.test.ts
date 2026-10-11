import { describe, it, expect, vi } from 'vitest';
import { compressToTargetSize } from '../lib/compression';

describe('Compression Search Logic', () => {
  it('respects null target size and keeps high quality', async () => {
    const mockBlob = new Blob(['sample-image-data'], { type: 'image/jpeg' });
    const mockCanvas = {
      width: 413,
      height: 531,
      toBlob: vi.fn((callback) => callback(mockBlob)),
    } as unknown as HTMLCanvasElement;

    // Mock FileReader
    global.FileReader = class {
      result = 'data:image/jpeg;base64,mock';
      onloadend: (() => void) | null = null;
      readAsDataURL() {
        if (this.onloadend) this.onloadend();
      }
    } as unknown as typeof FileReader;

    const res = await compressToTargetSize({
      canvas: mockCanvas,
      targetSizeKb: null,
      initialQuality: 0.92,
    });

    expect(res.sizeBytes).toBe(mockBlob.size);
    expect(res.quality).toBe(0.92);
    expect(res.width).toBe(413);
    expect(res.height).toBe(531);
  });
});
