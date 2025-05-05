// src/services/helpers/validators.js
// Utilities for validating data

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
  
  /**
   * Validate revision data
   * @param {Object} revision - Revision object to validate
   * @returns {Object} Validation result { isValid, errors }
   */
  export function validateRevision(revision) {
    const errors = [];
    
    if (!revision.articleId) {
      errors.push('Article ID is required');
    }
    
    if (!revision.content && revision.content !== '') {
      errors.push('Content is required');
    }
    
    if (!revision.editor) {
      errors.push('Editor ID is required');
    }
    
    // Validate content length if provided
    if (revision.content && revision.content.length > 300000) {
      errors.push('Content is too long (max 300,000 characters)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate user data
   * @param {Object} user - User object to validate
   * @returns {Object} Validation result { isValid, errors }
   */
  export function validateUser(user) {
    const errors = [];
    
    if (!user.uid) {
      errors.push('User ID is required');
    }
    
    // Validate email if provided
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push('Invalid email format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate search parameters
   * @param {Object} params - Search parameters
   * @returns {Object} Validation result { isValid, errors }
   */
  export function validateSearchParams(params) {
    const errors = [];
    
    if (!params.query && params.query !== '') {
      errors.push('Search query is required');
    }
    
    // If limit is provided, ensure it's a positive number
    if (params.limit !== undefined) {
      const limit = Number(params.limit);
      if (isNaN(limit) || limit <= 0) {
        errors.push('Limit must be a positive number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }