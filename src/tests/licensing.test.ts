import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateClientLicense,
  verifyClientLicense,
  activateLicense,
  getSavedLicense,
  clearActiveLicense
} from '../lib/licensing';

describe('Licensing & Subscription Engine', () => {
  beforeEach(() => {
    clearActiveLicense();
  });

  it('generates and verifies a lifetime license key', () => {
    const key = generateClientLicense('RAHUL', 'lifetime');
    expect(key.startsWith('TT-LIFE-RAHUL-0-')).toBe(true);

    const verified = verifyClientLicense(key);
    expect(verified.active).toBe(true);
    expect(verified.plan).toBe('lifetime');
    expect(verified.client).toBe('RAHUL');
    expect(verified.daysLeft).toBeNull();
  });

  it('generates and verifies 1 month, 3 months, 6 months, and 1 year plans', () => {
    const plans = ['1_month', '3_months', '6_months', '1_year'] as const;
    const expectedDays = [30, 90, 180, 365];

    plans.forEach((plan, idx) => {
      const key = generateClientLicense('STUDIO', plan);
      const res = verifyClientLicense(key);
      expect(res.active).toBe(true);
      expect(res.plan).toBe(plan);
      expect(res.daysLeft).toBeGreaterThanOrEqual(expectedDays[idx] - 1);
    });
  });

  it('rejects tampered or fabricated keys', () => {
    const key = generateClientLicense('DEMO', '1_year');
    const tampered = key.slice(0, -2) + '99'; // Modify checksum
    const res = verifyClientLicense(tampered);
    expect(res.active).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('activates and caches a valid key in storage', () => {
    const key = generateClientLicense('CLIENT1', '6_months');
    const act = activateLicense(key);
    expect(act.active).toBe(true);

    const retrieved = getSavedLicense();
    expect(retrieved.active).toBe(true);
    expect(retrieved.client).toBe('CLIENT1');
    expect(retrieved.plan).toBe('6_months');
  });
});
