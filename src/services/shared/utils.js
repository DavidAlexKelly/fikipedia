// /services/shared/utils.js
/**
 * Normalize a string for consistent comparisons
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().trim();
  }
  
  /**
   * Serialize a date for safe passing between server and client
   * @param {Date|string|Object|null} date - Date to serialize
   * @returns {string|null} ISO string or null
   */
  export function serializeDate(date) {
    if (!date) return null;
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    // If it's already a string, return as is
    if (typeof date === 'string') {
      return date;
    }
    
    // If it has a toDate method (like Firestore Timestamp)
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    
    return null;
  }
  
  /**
   * Deserialize an ISO date string to a Date object
   * @param {string|Date|null} dateStr - ISO date string
   * @returns {Date|null} Date object or null
   */
  export function deserializeDate(dateStr) {
    if (!dateStr) return null;
    
    // If it's already a Date, return as is
    if (dateStr instanceof Date) {
      return dateStr;
    }
    
    try {
      return new Date(dateStr);
    } catch (error) {
      console.error('Error deserializing date:', error);
      return null;
    }
  }
  
  /**
   * Validate article data
   * @param {Object} article - Article object to validate
   * @returns {Object} Validation result { isValid, errors }
   */
  export function validateArticle(article) {
    const errors = [];
    
    if (!article.title) {
      errors.push('Title is required');
    } else if (article.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    
    // Check for invalid characters in title
    if (article.title && /[#<>[\]|{}/:?]/.test(article.title)) {
      errors.push('Title contains invalid characters');
    }
    
    // Validate content if provided
    if (article.content && article.content.length > 300000) {
      errors.push('Content is too long (max 300,000 characters)');
    }
    
    // Validate categories if provided
    if (article.categories && !Array.isArray(article.categories)) {
      errors.push('Categories must be an array');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }