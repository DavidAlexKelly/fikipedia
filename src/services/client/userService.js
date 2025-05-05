// /services/client/userService.js
/**
 * Toggle watching an article
 * @param {string} articleId - Article ID
 * @returns {Promise<boolean>} New watch state (true if now watching)
 */
export async function toggleWatchArticle(articleId) {
    try {
      const response = await fetch(`/api/user/watch/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle watch status');
      }
      
      const result = await response.json();
      return result.isWatching;
    } catch (error) {
      console.error("Error toggling watch status:", error);
      throw error;
    }
  }