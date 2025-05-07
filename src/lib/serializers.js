// src/lib/serializers.js
/**
 * Serializes a date for safe passing between server and client
 */
export function serializeDate(date) {
    if (!date) return null;
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    if (typeof date === 'string') {
      return date;
    }
    
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    
    return null;
  }
  
  /**
   * Normalizes a string for consistent comparisons
   */
  export function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().trim();
  }
  
  /**
   * Serializes an article object
   */
  export function serializeArticle(article) {
    if (!article) return null;
    
    return {
      ...article,
      lastModified: serializeDate(article.lastModified),
      createdAt: serializeDate(article.createdAt)
    };
  }
  
  /**
   * Serializes an array of articles
   */
  export function serializeArticles(articles) {
    if (!articles) return [];
    return articles.map(article => serializeArticle(article));
  }
  
  // Add other serializers as needed