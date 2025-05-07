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
}

// Export a singleton instance
export const wikiRepository = new WikiRepository();