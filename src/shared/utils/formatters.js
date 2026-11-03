/**
 * VAAGAI Shared Formatting Utilities
 */

/**
 * Formats a number to Indian Rupee (INR) currency representation
 * @param {number|string} amount
 * @returns {string} e.g. "₹48,500"
 */
export function formatINR(amount) {
  const numeric = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Formats date into readable luxury format
 * @param {string|Date} dateVal
 * @returns {string} e.g. "14 Oct 2026"
 */
export function formatDate(dateVal) {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Safely truncate long descriptions
 */
export function truncate(str, maxLength = 100) {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

