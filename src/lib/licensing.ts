import { PlanDuration, APP_PLANS, LicenseStatus } from '../types/subscription';

const SECRET_SALT = 'APP_ACCESS_TOKEN_SALT_2026_SECURE';
const STORAGE_KEY = 'app_user_license_key';

// Fast pure JS 32-bit FNV-1a & Murmur3 mix for signature checking
function computeSignature(payload: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = SECRET_SALT + payload + SECRET_SALT;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (part1 + part2).substring(0, 8).toUpperCase();
}

/**
 * Creates a signed client license key
 */
export function generateClientLicense(clientName: string, plan: PlanDuration): string {
  const planConfig = APP_PLANS[plan];
  if (!planConfig) throw new Error('Unknown subscription plan');

  const cleanName = clientName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8) || 'CLIENT';

  const nowDays = Math.floor(Date.now() / 86400000);
  const expiryDays = planConfig.days === 0 ? 0 : nowDays + planConfig.days;

  const payload = `${planConfig.code}-${cleanName}-${expiryDays}`;
  const sig = computeSignature(payload);

  return `TT-${payload}-${sig}`;
}

/**
 * Verifies and parses a client license key
 */
export function verifyClientLicense(licenseKey: string): LicenseStatus {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { active: false, error: 'No license key provided' };
  }

  const trimmed = licenseKey.trim().toUpperCase();
  const parts = trimmed.split('-');

  // Format: TT-<CODE>-<CLIENT>-<EXPIRY_DAYS>-<SIG>
  if (parts.length !== 5 || parts[0] !== 'TT') {
    return { active: false, error: 'Invalid license format. Expected TT-XXX-XXXX-XXXX-XXXX' };
  }

  const [_, code, client, expiryDaysStr, sig] = parts;
  const payload = `${code}-${client}-${expiryDaysStr}`;
  const expectedSig = computeSignature(payload);

  if (sig !== expectedSig) {
    return { active: false, error: 'License verification failed. Signature mismatch.' };
  }

  // Find plan by code
  const planEntry = Object.values(APP_PLANS).find((p) => p.code === code);
  if (!planEntry) {
    return { active: false, error: 'Unrecognized plan identifier.' };
  }

  const expiryDays = parseInt(expiryDaysStr, 10);
  if (isNaN(expiryDays)) {
    return { active: false, error: 'Invalid expiration timestamp.' };
  }

  // Lifetime plan check
  if (expiryDays === 0 || planEntry.id === 'lifetime') {
    return {
      active: true,
      code: trimmed,
      client,
      plan: 'lifetime',
      planTitle: 'Lifetime Access',
      expiryDate: 'Never (Lifetime)',
      daysLeft: null,
    };
  }

  // Expiration check
  const nowDays = Math.floor(Date.now() / 86400000);
  const daysRemaining = expiryDays - nowDays;

  if (daysRemaining <= 0) {
    const expiredDate = new Date(expiryDays * 86400000).toLocaleDateString();
    return {
      active: false,
      code: trimmed,
      client,
      plan: planEntry.id,
      planTitle: planEntry.title,
      expiryDate: expiredDate,
      daysLeft: 0,
      error: `Subscription expired on ${expiredDate}. Please renew your plan.`,
    };
  }

  const validUntil = new Date(expiryDays * 86400000).toLocaleDateString();
  return {
    active: true,
    code: trimmed,
    client,
    plan: planEntry.id,
    planTitle: planEntry.title,
    expiryDate: validUntil,
    daysLeft: daysRemaining,
  };
}

let memoryStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStorage[key] || null;
}

function setStorageItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(key, val);
      return;
    }
  } catch {}
  memoryStorage[key] = val;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    if (typeof localStorage !== 'undefined' && localStorage.removeItem) {
      localStorage.removeItem(key);
    }
  } catch {}
  delete memoryStorage[key];
}

/**
 * Saves and activates a license key in localStorage
 */
export function activateLicense(licenseKey: string): LicenseStatus {
  const result = verifyClientLicense(licenseKey);
  if (result.active) {
    setStorageItem(STORAGE_KEY, licenseKey.trim().toUpperCase());
  }
  return result;
}

/**
 * Reads the stored active license from localStorage
 */
export function getSavedLicense(): LicenseStatus {
  try {
    const stored = getStorageItem(STORAGE_KEY);
    if (!stored) {
      return { active: false };
    }
    const verified = verifyClientLicense(stored);
    if (!verified.active) {
      removeStorageItem(STORAGE_KEY);
    }
    return verified;
  } catch {
    return { active: false };
  }
}

/**
 * Clears the active license
 */
export function clearActiveLicense(): void {
  removeStorageItem(STORAGE_KEY);
}
