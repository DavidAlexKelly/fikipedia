// src/repositories/wikiRepository.js
import { BaseRepository } from './baseRepository';
import { adminDb } from '@/lib/firebase/admin';
import { serializeDate } from '@/lib/serializers';

export class WikiRepository extends BaseRepository {
  constructor() {
    super('wiki'); // This might need adjustment based on your collection structure
  }

  /**
   * Get recent changes
   * @param {number} limit - Maximum number of changes to return
   * @returns {Promise<Array>} Array of recently changed articles
   */
  async getRecentChanges(limit = 50) {
    try {
      const articlesQuery = adminDb.collection('articles')
        .orderBy('lastModified', 'desc')
        .limit(limit);
      
      const snapshot = await articlesQuery.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const articles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          lastModified: serializeDate(data.lastModified),
          lastEditor: data.lastEditor,
          createdAt: serializeDate(data.createdAt),
          categories: data.categories || []
        };
      });
      
      return articles;
    } catch (error) {
      console.error("Repository error getting recent changes:", error);
      throw new Error('Failed to fetch recent changes');
    }
  }

  /**
   * Get site statistics
   * @returns {Promise<Object>} Site statistics
   */
  async getSiteStats() {
    try {
      // Article count
      const articleCountPromise = adminDb.collection('articles').count().get()
        .then(snap => snap.data().count);
      
      // User count
      const userCountPromise = adminDb.collection('users').count().get()
        .then(snap => snap.data().count);
      
      // Revision count
      const revisionCountPromise = adminDb.collection('revisions').count().get()
        .then(snap => snap.data().count);
      
      // Category count
      const categoryCountPromise = adminDb.collection('categories').count().get()
        .then(snap => snap.data().count);
      
      // Fetch all counts in parallel
      const [articleCount, userCount, revisionCount, categoryCount] = 
        await Promise.all([
          articleCountPromise, 
          userCountPromise, 
          revisionCountPromise,
          categoryCountPromise
        ]);
      
      return {
        articleCount,
        userCount,
        revisionCount,
        categoryCount,
        lastUpdated: serializeDate(new Date())
      };
    } catch (error) {
      console.error("Repository error getting site stats:", error);
      throw new Error('Failed to fetch site statistics');
    }
  }

  /**
 * Get featured content
 * @param {number} limit - Maximum number of featured items to return
 * @returns {Promise<Object>} Featured content
 */
async getFeaturedContent(limit = 5) {
    try {
      // For now, return mock data to avoid database errors
      return {
        article: {
          id: 'mock-featured-article',
          title: 'The Kingdom of Eldoria',
          excerpt: 'A fictional medieval realm created by fantasy author J.R. Tolkien in his bestselling series "Chronicles of the Lost Crown." Established in the Third Age after the Great Cataclysm...',
          lastModified: new Date().toISOString()
        },
        didYouKnow: [
          "the fictional language Elvish has over 10,000 words created for various fictional settings",
          "the city of New Prometheus appears in over 50 different science fiction novels by different authors",
          "the most linked fictional character on Fikipedia is Detective Alex Morgan, who appears in 15 different fictional universes"
        ]
      };
    } catch (error) {
      console.error("Repository error getting featured content:", error);
      
      // Return default data even on error
      return {
        article: null,
        didYouKnow: []
      };
    }
  }

  /**
   * Submit feedback about the wiki
   * @param {Object} feedbackData - Feedback data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async submitFeedback(feedbackData, userId) {
    try {
      if (!feedbackData) {
        throw new Error("Feedback data is required");
      }
      
      const feedbackRef = adminDb.collection('feedback').doc();
      
      await feedbackRef.set({
        ...feedbackData,
        userId: userId,
        createdAt: adminDb.FieldValue.serverTimestamp(),
        status: 'new'
      });
      
      return { success: true, id: feedbackRef.id };
    } catch (error) {
      console.error("Repository error submitting feedback:", error);
      throw new Error('Failed to submit feedback');
    }
  }

  /**
   * Get site announcements
   * @returns {Promise<Array>} Array of announcements
   */
  async getAnnouncements() {
    try {
      const announcementsQuery = adminDb.collection('announcements')
        .where('active', '==', true)
        .orderBy('createdAt', 'desc');
      
      const snapshot = await announcementsQuery.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: serializeDate(data.createdAt),
          expiresAt: serializeDate(data.expiresAt),
          importance: data.importance || 'normal'
        };
      });
    } catch (error) {
      console.error("Repository error getting announcements:", error);
      throw new Error('Failed to fetch announcements');
    }
  }
}

// Export a singleton instance
export const wikiRepository = new WikiRepository();