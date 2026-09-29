/**
 * Utilidades de sanitización y validación defensiva para prevenir XSS,
 * inyección de contenido y abusos de longitud de buffer.
 */

export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeString(val: any, maxLength = 255): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  return str.slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const clean = email.trim();
  if (clean.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean);
}

export function isValidRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 8 || clean.length > 9) return false;
  return true;
}
