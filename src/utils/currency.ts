/**
 * Currency utility functions for USD formatting and parsing
 */

/**
 * Formats a number as USD currency string
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$25.00")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a number as USD currency string without the dollar sign
 * @param amount - The numeric amount to format
 * @returns Formatted currency string without symbol (e.g., "25.00")
 */
export const formatCurrencyWithoutSymbol = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Parses a currency string to a number
 * Handles strings with or without dollar signs, commas, etc.
 * @param currencyString - The currency string to parse (e.g., "$25.00", "25", "25.50")
 * @returns The numeric value, or 0 if parsing fails
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbols, commas, and whitespace
  const cleanedString = currencyString
    .replace(/[$,\s]/g, '')
    .trim();

  // Parse as float
  const parsed = parseFloat(cleanedString);
  
  // Return 0 if not a valid number
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validates if a string can be parsed as a valid currency amount
 * @param currencyString - The string to validate
 * @returns True if the string is a valid currency format
 */
export const isValidCurrency = (currencyString: string): boolean => {
  if (!currencyString || typeof currencyString !== 'string') {
    return false;
  }

  // Remove currency symbols, commas, and whitespace
  const cleanedString = currencyString
    .replace(/[$,\s]/g, '')
    .trim();

  // Check if it's a valid number and not negative
  const parsed = parseFloat(cleanedString);
  return !isNaN(parsed) && parsed >= 0;
};

/**
 * Formats user input for currency display in text inputs
 * Automatically adds appropriate formatting as user types
 * @param input - The current input string
 * @returns Formatted input string
 */
export const formatCurrencyInput = (input: string): string => {
  if (!input) return '';

  // Remove non-numeric characters except decimal point
  const numbersOnly = input.replace(/[^\d.]/g, '');
  
  // Handle multiple decimal points
  const parts = numbersOnly.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit to 2 decimal places
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }

  return parts.join('.');
};