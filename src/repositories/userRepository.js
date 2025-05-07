// src/repositories/userRepository.js
import { BaseRepository } from './baseRepository';
import { adminDb } from '@/lib/firebase/admin';
import { serializeDate } from '@/lib/serializers';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }
  
  async findByUid(uid) {
    try {
      if (!uid) return null;
      
      const userQuery = this.collection
        .where("uid", "==", uid)
        .limit(1);
      
      const snapshot = await userQuery.get();
      
      if (snapshot.empty) return null;
      
      return this.serializeDocument(snapshot.docs[0]);
    } catch (error) {
      console.error(`Error finding user by UID: ${error}`);
      throw error;
    }
  }
  
  async update(userId, updates) {
    try {
      if (!userId || !updates) {
        throw new Error("Missing required information");
      }
      
      // Find user document
      const user = await this.findByUid(userId);
      if (!user) throw new Error("User not found");
      
      const userDocRef = this.collection.doc(user.id);
      
      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: adminDb.FieldValue.serverTimestamp()
      };
      
      await userDocRef.update(updateData);
      
      const updatedUserSnap = await userDocRef.get();
      return this.serializeDocument(updatedUserSnap);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  
  async getContributions(userId, limit = 50) {
    try {
      if (!userId) return [];
      
      // Get revisions by this user
      const revisionsQuery = adminDb.collection("revisions")
        .where("editor", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit);
      
      const revisionsSnapshot = await revisionsQuery.get();
      
      if (revisionsSnapshot.empty) return [];
      
      const revisions = revisionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: serializeDate(data.timestamp)
        };
      });
      
      // Batch fetch article titles
      const articleIds = [...new Set(revisions.map(rev => rev.articleId))];
      const articleTitles = {};
      
      // Fetch each article individually
      for (const articleId of articleIds) {
        try {
          const articleDoc = await adminDb.collection("articles").doc(articleId).get();
          if (articleDoc.exists) {
            articleTitles[articleId] = articleDoc.data().title || "Unknown Article";
          } else {
            articleTitles[articleId] = "Unknown Article";
          }
        } catch (err) {
          console.error(`Error fetching article ${articleId}:`, err);
          articleTitles[articleId] = "Unknown Article";
        }
      }
      
      // Add article titles to revisions
      return revisions.map(revision => ({
        ...revision,
        articleTitle: articleTitles[revision.articleId] || "Unknown Article"
      }));
    } catch (error) {
      console.error("Error getting user contributions:", error);
      throw error;
    }
  }
  
  async toggleWatchArticle(userId, articleId) {
    try {
      if (!userId || !articleId) {
        throw new Error("Missing required information");
      }
      
      // Find user document
      const user = await this.findByUid(userId);
      if (!user) throw new Error("User not found");
      
      const userDocRef = this.collection.doc(user.id);
      
      // Check if article is already in watchlist
      const watchlist = user.watchlist || [];
      const isWatched = watchlist.includes(articleId);
      
      if (isWatched) {
        // Remove from watchlist
        await userDocRef.update({
          watchlist: adminDb.FieldValue.arrayRemove(articleId),
          updatedAt: adminDb.FieldValue.serverTimestamp()
        });
        return false;
      } else {
        // Add to watchlist
        await userDocRef.update({
          watchlist: adminDb.FieldValue.arrayUnion(articleId),
          updatedAt: adminDb.FieldValue.serverTimestamp()
        });
        return true;
      }
    } catch (error) {
      console.error("Error toggling watch status:", error);
      throw error;
    }
  }
  
  async getWatchedArticles(userId) {
    try {
      if (!userId) return [];
      
      // Find user document
      const user = await this.findByUid(userId);
      if (!user) return [];
      
      const watchlist = user.watchlist || [];
      if (watchlist.length === 0) return [];
      
      // Fetch articles
      const articles = [];
      
      for (const articleId of watchlist) {
        try {
          const articleDoc = await adminDb.collection("articles").doc(articleId).get();
          if (articleDoc.exists) {
            const articleData = articleDoc.data();
            articles.push({
              id: articleDoc.id,
              ...articleData,
              lastModified: serializeDate(articleData.lastModified),
              createdAt: serializeDate(articleData.createdAt)
            });
          }
        } catch (err) {
          console.error(`Error fetching article ${articleId}:`, err);
        }
      }
      
      return articles;
    } catch (error) {
      console.error("Error getting watched articles:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();