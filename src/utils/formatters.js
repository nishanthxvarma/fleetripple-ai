/**
 * Shared Formatting Utilities for FleetRipple AI
 * Handles null, undefined, NaN, and invalid inputs gracefully without throwing exceptions.
 */

/**
 * Format currency in Indian Rupees (₹)
 * @param {number|string|null|undefined} value 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatCurrency(value, fallback = '₹0') {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

/**
 * Format general numbers with commas
 * @param {number|string|null|undefined} value 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatNumber(value, fallback = '0') {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num.toLocaleString('en-IN');
}

/**
 * Format percentage
 * @param {number|string|null|undefined} value 
 * @param {number} decimals 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatPercent(value, decimals = 1, fallback = '0.0%') {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format time string or date
 * @param {string|Date|null|undefined} value 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatTime(value, fallback = '--:--') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
  } catch {
    return fallback;
  }
}

/**
 * Format date string
 * @param {string|Date|null|undefined} value 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatDate(value, fallback = 'N/A') {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return fallback;
  }
}
