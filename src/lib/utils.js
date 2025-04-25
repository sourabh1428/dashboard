import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * A utility function that combines classnames
 * It uses clsx to combine classnames and tailwind-merge to handle Tailwind CSS classes properly
 * This is useful for conditional classnames and merging tailwind classes
 *
 * @param {...string} inputs - Any number of classes to be combined
 * @returns {string} - The combined classnames
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 * 
 * @param {string|Date} date - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return "";
  
  const defaultOptions = { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  };
  
  return new Intl.DateTimeFormat(
    "en-US", 
    { ...defaultOptions, ...options }
  ).format(new Date(date));
}

/**
 * Format a number as currency
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
