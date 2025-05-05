// src/services/helpers/serializers.js
// Utilities for data serialization

/**
 * Serializes a date for safe passing between server and client
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
   * Serializes an article object for safe passing between server and client
   * @param {Object} article - Article object
   * @returns {Object|null} Serialized article
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
   * @param {Array} articles - Array of article objects
   * @returns {Array} Serialized articles
   */
  export function serializeArticles(articles) {
    if (!articles) return [];
    
    return articles.map(article => serializeArticle(article));
  }
  
  /**
   * Serializes a revision object for safe passing between server and client
   * @param {Object} revision - Revision object
   * @returns {Object|null} Serialized revision
   */
  export function serializeRevision(revision) {
    if (!revision) return null;
    
    return {
      ...revision,
      timestamp: serializeDate(revision.timestamp)
    };
  }
  
  /**
   * Serializes an array of revisions
   * @param {Array} revisions - Array of revision objects
   * @returns {Array} Serialized revisions
   */
  export function serializeRevisions(revisions) {
    if (!revisions) return [];
    
    return revisions.map(revision => serializeRevision(revision));
  }
  
  /**
   * Serializes a user object for safe passing between server and client
   * @param {Object} user - User object
   * @returns {Object|null} Serialized user
   */
  export function serializeUser(user) {
    if (!user) return null;
    
    return {
      ...user,
      createdAt: serializeDate(user.createdAt),
      updatedAt: serializeDate(user.updatedAt),
      lastLogin: serializeDate(user.lastLogin)
    };
  }
  
  /**
   * Serializes an array of users
   * @param {Array} users - Array of user objects
   * @returns {Array} Serialized users
   */
  export function serializeUsers(users) {
    if (!users) return [];
    
    return users.map(user => serializeUser(user));
  }
  
  /**
   * Serializes any Firestore document that may contain Date objects
   * or other complex types
   * @param {Object} doc - Document object
   * @returns {Object|null} Serialized document
   */
  export function serializeDocument(doc) {
    if (!doc) return null;
    
    const result = { ...doc };
    
    // Process all properties
    Object.keys(result).forEach(key => {
      const value = result[key];
      
      // Handle Date objects
      if (value instanceof Date) {
        result[key] = value.toISOString();
      }
      // Handle Firestore Timestamps
      else if (value && typeof value.toDate === 'function') {
        result[key] = value.toDate().toISOString();
      }
      // Handle nested objects
      else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = serializeDocument(value);
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        result[key] = value.map(item => {
          if (item instanceof Date) {
            return item.toISOString();
          } else if (item && typeof item.toDate === 'function') {
            return item.toDate().toISOString();
          } else if (item && typeof item === 'object') {
            return serializeDocument(item);
          }
          return item;
        });
      }
    });
    
    return result;
  }
  
  /**
   * Deserializes an ISO date string to a Date object
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