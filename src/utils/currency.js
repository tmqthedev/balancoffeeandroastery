// Utility functions for formatting currency and numbers

/**
 * Format a number as Vietnamese Dong (VND) currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol
 * @returns {string} Formatted currency string
 */
export const formatVND = (amount, showSymbol = true) => {
  if (!amount && amount !== 0) return showSymbol ? '0₫' : '0';
  
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return showSymbol ? `${formatted}₫` : formatted;
};

/**
 * Format a price with compare price
 * @param {number} price - Current price in VND
 * @param {number} comparePrice - Compare price in VND
 * @returns {object} Formatted price object
 */
export const formatPrice = (price, comparePrice = null) => {
  const result = {
    price: formatVND(price),
    priceNumber: price
  };
  
  if (comparePrice && comparePrice > price) {
    result.comparePrice = formatVND(comparePrice);
    result.comparePriceNumber = comparePrice;
    result.discount = Math.round(((comparePrice - price) / comparePrice) * 100);
  }
  
  return result;
};

/**
 * Parse VND string back to number
 * @param {string} vndString - VND formatted string
 * @returns {number} Numeric value
 */
export const parseVND = (vndString) => {
  if (typeof vndString === 'number') return vndString;
  if (!vndString) return 0;
  
  // Remove currency symbol and formatting
  return parseInt(vndString.replace(/[₫,.]/g, ''), 10) || 0;
};

/**
 * Convert USD to VND (for migration purposes only)
 * @param {number} usd - USD amount
 * @param {number} rate - Exchange rate (default 25000)
 * @returns {number} VND amount
 */
export const usdToVnd = (usd, rate = 25000) => {
  return Math.round(usd * rate);
};

export default {
  formatVND,
  formatPrice,
  parseVND,
  usdToVnd
};
