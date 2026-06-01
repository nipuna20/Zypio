/**
 * Service for generating tracking numbers for orders. The tracking
 * number includes a prefix, date and a zero-padded order ID.
 */

/**
 * Pad a numeric value with leading zeros to a specified length.
 * @param {number} num - The number to pad
 * @param {number} size - Desired total length (default 4)
 */
function pad(num, size = 4) {
  return String(num).padStart(size, '0');
}

/**
 * Format a Date object into YYYYMMDD format (no separators).
 * @param {Date} date - A date to format
 * @returns {string} formatted date string
 */
function formatDateYYYYMMDD(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Generate a tracking number string given an order id. The format
 * is PREFIX-YYYYMMDD-#### where #### is a zero-padded order id.
 * @param {number} orderId - The numeric order id
 * @returns {string} generated tracking number
 */
function generateTrackingNumber(orderId) {
  // Prefix could be customized or moved to environment if needed
  const prefix = 'ZYP';
  return `${prefix}-${formatDateYYYYMMDD()}-${pad(orderId, 4)}`;
}

module.exports = { generateTrackingNumber };