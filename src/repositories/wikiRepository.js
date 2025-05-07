// src/repositories/wikiRepository.js
import { adminDb } from '@/lib/firebase/admin';
import { serializeDate } from '@/lib/serializers';

export class WikiRepository {
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
      console.error("Server error getting site stats:", error);
      throw new Error('Failed to fetch site statistics');
    }
  }
  
  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    try {
      const snapshot = await adminDb.collection('categories').get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          normalizedName: data.normalizedName,
          articleCount: data.articleCount || 0,
          updatedAt: serializeDate(data.updatedAt)
        };
      });
    } catch (error) {
      console.error("Error getting all categories:", error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getArticlesByCategory(category, limit = 50) {
    try {
      // Normalize category name
      const normalizedCategory = normalizeString(category);
      
      // Query articles in this category
      const articlesQuery = adminDb.collection('articles')
        .where('categories', 'array-contains', category)
        .orderBy('lastModified', 'desc')
        .limit(limit);
      
      const snapshot = await articlesQuery.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => this.serializeDocument(doc));
    } catch (error) {
      console.error("Error getting articles by category:", error);
      throw error;
    }
  }
  
  async getCategoryInfo(category) {
    try {
      if (!category) return null;
      
      // Normalize category name
      const normalizedCategory = normalizeString(category);
      
      // Get articles count in this category
      const articlesCountQuery = adminDb.collection('articles')
        .where('categories', 'array-contains', category)
        .count();
      
      const countSnapshot = await articlesCountQuery.get();
      const articleCount = countSnapshot.data().count;
      
      return {
        name: category,
        normalizedName: normalizedCategory,
        articleCount,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error getting category info:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const wikiRepository = new WikiRepository();