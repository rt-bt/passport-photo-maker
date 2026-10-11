import { describe, it, expect } from 'vitest';
import { PASSPORT_PRESETS, PAPER_SIZES } from '../lib/presets';

describe('Passport Presets & Paper Sizes Integrity', () => {
  it('contains essential international country presets', () => {
    const ids = PASSPORT_PRESETS.map((p) => p.id);
    expect(ids).toContain('in-passport');
    expect(ids).toContain('in-pan');
    expect(ids).toContain('in-aadhaar-exam');
    expect(ids).toContain('us-passport');
    expect(ids).toContain('uk-schengen');
    expect(ids).toContain('ca-passport');
    expect(ids).toContain('cn-visa');
    expect(ids).toContain('stamp-size');
  });

  it('all presets have positive dimensions and valid head height proportions', () => {
    for (const preset of PASSPORT_PRESETS) {
      expect(preset.widthMm).toBeGreaterThan(0);
      expect(preset.heightMm).toBeGreaterThan(0);
      expect(preset.headHeightMinPercent).toBeGreaterThan(0);
      expect(preset.headHeightMaxPercent).toBeGreaterThanOrEqual(preset.headHeightMinPercent);
      expect(preset.complianceNotes.length).toBeGreaterThan(0);
    }
  });

  it('contains standard paper sizes including A4 and 4x6', () => {
    const paperIds = PAPER_SIZES.map((p) => p.id);
    expect(paperIds).toContain('a4');
    expect(paperIds).toContain('4x6');
    expect(paperIds).toContain('letter');
    expect(paperIds).toContain('5x7');
    expect(paperIds).toContain('a5');
    expect(paperIds).toContain('legal');
  });
});
