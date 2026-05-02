// Utility Functions for Unified AI Workspace

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS merge
 * @param {...string} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date to a relative time string
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) return 'เมื่อสักครู่';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
  
  return formatDate(date);
}

/**
 * Generates a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Extracts text content from markdown
 * @param {string} markdown - Markdown content
 * @returns {string} Plain text content
 */
export function extractTextFromMarkdown(markdown) {
  if (!markdown) return '';
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounces a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
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

/**
 * Throttles a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Calculates reading time for text
 * @param {string} text - Text to calculate reading time for
 * @param {number} wordsPerMinute - Reading speed (default: 200 WPM)
 * @returns {number} Reading time in minutes
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Formats file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generates a color based on a string
 * @param {string} str - String to generate color from
 * @returns {string} Hex color code
 */
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

/**
 * Checks if a string contains any of the search terms
 * @param {string} text - Text to search in
 * @param {string[]} searchTerms - Terms to search for
 * @returns {boolean} Whether text contains any search terms
 */
export function containsSearchTerms(text, searchTerms) {
  if (!text || !searchTerms || searchTerms.length === 0) return false;
  const lowerText = text.toLowerCase();
  return searchTerms.some(term => lowerText.includes(term.toLowerCase()));
}

/**
 * Highlights search terms in text
 * @param {string} text - Text to highlight
 * @param {string[]} searchTerms - Terms to highlight
 * @returns {string} Text with highlighted terms
 */
export function highlightSearchTerms(text, searchTerms) {
  if (!text || !searchTerms || searchTerms.length === 0) return text;
  
  let highlightedText = text;
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}
