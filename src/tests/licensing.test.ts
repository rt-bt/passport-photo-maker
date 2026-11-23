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

  it('generates and verifies a lifetime license key with email ID', () => {
    const email = 'client@gmail.com';
    const key = generateClientLicense(email, 'lifetime');

    // Verification with matching email succeeds
    const verified = verifyClientLicense(key, email);
    expect(verified.active).toBe(true);
    expect(verified.plan).toBe('lifetime');
    expect(verified.email).toBe(email);
    expect(verified.daysLeft).toBeNull();
  });

  it('rejects license key when accessed with a different/unauthorized email', () => {
    const correctEmail = 'authorized@company.com';
    const attackerEmail = 'hacker@other.com';
    const key = generateClientLicense(correctEmail, '1_year');

    // Matching email works
    const resAuth = verifyClientLicense(key, correctEmail);
    expect(resAuth.active).toBe(true);
    expect(resAuth.plan).toBe('1_year');

    // Mismatched email fails
    const resAttacker = verifyClientLicense(key, attackerEmail);
    expect(resAttacker.active).toBe(false);
    expect(resAttacker.error).toContain('does not match this Email ID');
  });

  it('generates and verifies 1 month, 3 months, 6 months, and 1 year plans', () => {
    const plans = ['1_month', '3_months', '6_months', '1_year'] as const;
    const expectedDays = [30, 90, 180, 365];
    const testEmail = 'user@studio.in';

    plans.forEach((plan, idx) => {
      const key = generateClientLicense(testEmail, plan);
      const res = verifyClientLicense(key, testEmail);
      expect(res.active).toBe(true);
      expect(res.plan).toBe(plan);
      expect(res.daysLeft).toBeGreaterThanOrEqual(expectedDays[idx] - 1);
    });
  });

  it('rejects tampered or fabricated keys', () => {
    const email = 'demo@example.com';
    const key = generateClientLicense(email, '1_year');
    const tampered = key.slice(0, -2) + '99'; // Modify checksum
    const res = verifyClientLicense(tampered, email);
    expect(res.active).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('activates and caches a valid key and email in storage', () => {
    const email = 'subscriber@shop.com';
    const key = generateClientLicense(email, '6_months');
    const act = activateLicense(key, email);
    expect(act.active).toBe(true);

    const retrieved = getSavedLicense();
    expect(retrieved.active).toBe(true);
    expect(retrieved.email).toBe(email);
    expect(retrieved.plan).toBe('6_months');
  });
});
