// src/services/types.js
// Type definitions for the Fikipedia application

/**
 * @typedef {Object} Article
 * @property {string} id - Article ID
 * @property {string} title - Article title
 * @property {string} normalizedTitle - Lowercase version of title for searching
 * @property {string} content - Article content in wiki markup
 * @property {string[]} categories - Array of categories
 * @property {string} createdBy - User ID of creator
 * @property {string} lastEditor - User ID of last editor
 * @property {Date|string} createdAt - Creation date
 * @property {Date|string} lastModified - Last modification date
 * @property {number} viewCount - Number of views
 * @property {boolean} isRedirect - Whether this is a redirect page
 */

/**
 * @typedef {Object} Revision
 * @property {string} id - Revision ID
 * @property {string} articleId - ID of associated article
 * @property {string} content - Article content in wiki markup
 * @property {string} editor - User ID of editor
 * @property {string} summary - Edit summary
 * @property {string|null} previousRevision - ID of previous revision
 * @property {string|null} articleTitle - Title of the associated article
 * @property {Date|string} timestamp - When revision was made
 */

/**
 * @typedef {Object} User
 * @property {string} id - User document ID
 * @property {string} uid - Firebase Auth UID
 * @property {string} email - User email
 * @property {string} displayName - Display name
 * @property {string|null} photoURL - Profile photo URL
 * @property {string[]} watchlist - Array of article IDs being watched
 * @property {Object} settings - User preferences
 * @property {Date|string} createdAt - Account creation date
 * @property {Date|string} updatedAt - Last profile update date
 * @property {Date|string} lastLogin - Last login date
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Category ID
 * @property {string} name - Category name
 * @property {string} normalizedName - Lowercase version of category name
 * @property {number} articleCount - Number of articles in this category
 * @property {Date|string} updatedAt - Last update date
 */

/**
 * @typedef {Object} SiteStats
 * @property {number} articleCount - Total number of articles
 * @property {number} userCount - Total number of users
 * @property {number} revisionCount - Total number of revisions
 * @property {number} imageCount - Total number of images
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} objectID - Algolia object ID
 * @property {string} title - Article title
 * @property {string} content - Article content snippet
 * @property {string[]} categories - Article categories
 * @property {Date|string} lastModified - Last modification date
 * @property {Object} _highlightResult - Algolia highlighting information
 */

// Module exports (for use with TypeScript or JSDoc documentation)
export {};