// /services/client/articleService.js

/**
 * Cache for client-side operations
 */
const articleCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Get an article by title
 * @param {string} title - Article title
 * @returns {Promise<Object|null>} Article object or null if not found
 */
export async function getArticleByTitle(title) {
  if (!title) return null;
  
  try {
    // Check cache first
    const cacheKey = `article:${title.toLowerCase()}`;
    if (articleCache.has(cacheKey)) {
      const cachedData = articleCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData.data;
      }
      // Cache expired, remove it
      articleCache.delete(cacheKey);
    }
    
    // Fetch from API
    const response = await fetch(`/api/articles/${encodeURIComponent(title)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching article: ${response.statusText}`);
    }
    
    const article = await response.json();
    
    // Store in cache
    articleCache.set(cacheKey, {
      data: article,
      timestamp: Date.now()
    });
    
    return article;
  } catch (error) {
    console.error("Error getting article:", error);
    throw error;
  }
}

/**
 * Create a new article
 * @param {Object} articleData - Article data
 * @returns {Promise<Object>} New article data
 */
export async function createArticle(articleData) {
  try {
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create article');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

// Additional methods would follow similar patterns