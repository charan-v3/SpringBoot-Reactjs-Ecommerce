/**
 * Currency utility functions for consistent formatting
 */

/**
 * Format currency in Indian Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }
  
  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `₹${formattedAmount}` : formattedAmount;
};

/**
 * Format currency for display in tables or compact spaces
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted currency string
 */
export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const num = Number(amount);
  
  if (num >= 10000000) { // 1 crore
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  } else if (num >= 100000) { // 1 lakh
    return `₹${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) { // 1 thousand
    return `₹${(num / 1000).toFixed(1)}K`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Currency constants
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee'
};
