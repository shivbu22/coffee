// Shared input validation for FindCo forms. Pure functions, no side effects.

export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length < 3 || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function validateEmail(value) {
  return isValidEmail(value) ? null : 'Please enter a valid email address.';
}

/** Indian mobile: accepts 9876543210, +91 98765 43210, 09876543210. Returns normalised 10 digits or null. */
export function normalizePhoneIN(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  let digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}

export function isValidPhoneIN(value) {
  return normalizePhoneIN(value) !== null;
}

export function validatePhoneIN(value) {
  return isValidPhoneIN(value) ? null : 'Please enter a valid 10-digit Indian mobile number.';
}

/** Minimum 8 chars (production rule). Returns { ok, errors[] }. */
export function passwordStrength(password) {
  const errors = [];
  const pw = typeof password === 'string' ? password : '';
  if (pw.length < 8) errors.push('Password must be at least 8 characters.');
  if (!/[a-z]/.test(pw)) errors.push('Add a lowercase letter.');
  if (!/[A-Z]/.test(pw)) errors.push('Add an uppercase letter.');
  if (!/\d/.test(pw)) errors.push('Add a number.');
  return { ok: errors.length === 0, errors, length: pw.length };
}

export function validatePassword(password) {
  const { ok, errors } = passwordStrength(password);
  return ok ? null : errors[0];
}

/** Amount in rupees: finite, > 0, <= maxRupees, at most 2 decimal places. */
export function isValidAmount(value, maxRupees = 100000) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return false;
  if (n <= 0 || n > maxRupees) return false;
  return Math.round(n * 100) === n * 100 || Number.isInteger(n * 100);
}

export function validateAmount(value, maxRupees = 100000) {
  return isValidAmount(value, maxRupees) ? null : 'Please enter a valid amount.';
}
