// src/repositories/articleRepository.js
import { BaseRepository } from './baseRepository';
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString, serializeArticle, serializeArticles } from '@/lib/serializers';
import { ValidationError, NotFoundError } from '@/lib/errors/appErrors';

export class ArticleRepository extends BaseRepository {
  constructor() {
    super('articles');
  }

  async findByTitle(title) {
    try {
      if (!title) return null;
      
      const normalizedTitle = normalizeString(title);
      const snapshot = await this.collection
        .where('normalizedTitle', '==', normalizedTitle)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      return serializeArticle(this.serializeDocument(snapshot.docs[0]));
    } catch (error) {
      console.error(`Error finding article by title: ${error}`);
      throw error;
    }
  }

  async create(articleData, userId) {
    try {
      if (!articleData?.title || !userId) {
        throw new ValidationError("Missing required information");
      }

      // Check if article with this title already exists
      const existingArticle = await this.findByTitle(articleData.title);
      if (existingArticle) {
        throw new ValidationError("An article with this title already exists");
      }

      const batch = adminDb.batch();
      const newArticleRef = this.collection.doc();
      const revisionsRef = adminDb.collection("revisions").doc();
      
      const normalizedTitle = normalizeString(articleData.title);
      const categoryArray = articleData.categories || [];
      
      // Create article document
      const articleDocData = {
        title: articleData.title,
        normalizedTitle,
        content: articleData.content || "",
        categories: categoryArray,
        createdAt: adminDb.FieldValue.serverTimestamp(),
        createdBy: userId,
        lastModified: adminDb.FieldValue.serverTimestamp(),
        lastEditor: userId,
        viewCount: 0,
        isRedirect: false
      };
      
      batch.set(newArticleRef, articleDocData);
      
      // Create initial revision
      const revisionDocData = {
        articleId: newArticleRef.id,
        content: articleData.content || "",
        timestamp: adminDb.FieldValue.serverTimestamp(),
        editor: userId,
        summary: articleData.summary || "Initial creation",
        previousRevision: null
      };
      
      batch.set(revisionsRef, revisionDocData);
      
      // Update categories
      for (const category of categoryArray) {
        const normalizedCategory = normalizeString(category);
        const categoryRef = adminDb.collection("categories").doc(normalizedCategory);
        
        batch.set(categoryRef, {
          name: category,
          normalizedName: normalizedCategory,
          articleCount: adminDb.FieldValue.increment(1),
          updatedAt: adminDb.FieldValue.serverTimestamp()
        }, { merge: true });
      }
      
      await batch.commit();
      
      return {
        id: newArticleRef.id,
        title: articleData.title
      };
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  }
  
  async update(articleId, updates, userId, summary) {
    try {
      if (!articleId || !userId || !updates) {
        throw new ValidationError("Missing required information");
      }
      
      // Get the article
      const articleRef = this.collection.doc(articleId);
      const articleSnap = await articleRef.get();
      
      if (!articleSnap.exists) {
        throw new NotFoundError("Article not found");
      }
      
      const articleData = articleSnap.data();
      const previousContent = articleData.content;
      const previousCategories = articleData.categories || [];
      
      // Get the latest revision
      const revisionsQuery = adminDb.collection("revisions")
        .where("articleId", "==", articleId)
        .orderBy("timestamp", "desc")
        .limit(1);
      
      const revisionSnapshot = await revisionsQuery.get();
      
      const previousRevisionId = revisionSnapshot.empty 
        ? null 
        : revisionSnapshot.docs[0].id;
      
      // Start a batch
      const batch = adminDb.batch();
      
      // Update article
      const updateData = {
        ...updates,
        lastModified: adminDb.FieldValue.serverTimestamp(),
        lastEditor: userId
      };
      
      batch.update(articleRef, updateData);
      
      // Create new revision
      const revisionsRef = adminDb.collection("revisions").doc();
      
      const revisionData = {
        articleId: articleId,
        content: updates.content || previousContent,
        timestamp: adminDb.FieldValue.serverTimestamp(),
        editor: userId,
        summary: summary || "Updated article",
        previousRevision: previousRevisionId
      };
      
      batch.set(revisionsRef, revisionData);
      
      // Handle category changes if present
      if (updates.categories) {
        const newCategories = updates.categories;
        const categoriesAdded = newCategories.filter(cat => !previousCategories.includes(cat));
        const categoriesRemoved = previousCategories.filter(cat => !newCategories.includes(cat));
        
        // Add new categories
        for (const category of categoriesAdded) {
          const normalizedCategory = normalizeString(category);
          const categoryRef = adminDb.collection("categories").doc(normalizedCategory);
          
          batch.set(categoryRef, {
            name: category,
            normalizedName: normalizedCategory,
            articleCount: adminDb.FieldValue.increment(1),
            updatedAt: adminDb.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        // Remove old categories
        for (const category of categoriesRemoved) {
          const normalizedCategory = normalizeString(category);
          const categoryRef = adminDb.collection("categories").doc(normalizedCategory);
          
          batch.update(categoryRef, {
            articleCount: adminDb.FieldValue.increment(-1),
            updatedAt: adminDb.FieldValue.serverTimestamp()
          });
        }
      }
      
      await batch.commit();
      
      // Get the updated article
      const updatedArticleSnap = await articleRef.get();
      return serializeArticle(this.serializeDocument(updatedArticleSnap));
    } catch (error) {
      console.error("Error updating article:", error);
      throw error;
    }
  }
  
  async getRevisions(articleId, limit = 20) {
    try {
      if (!articleId) return [];
      
      const revisionsQuery = adminDb.collection("revisions")
        .where("articleId", "==", articleId)
        .orderBy("timestamp", "desc")
        .limit(limit);
      
      const snapshot = await revisionsQuery.get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
        };
      });
    } catch (error) {
      console.error("Error getting article revisions:", error);
      throw error;
    }
  }
  
  async getRecentChanges(limit = 50) {
    try {
      const articlesQuery = this.collection
        .orderBy("lastModified", "desc")
        .limit(limit);
      
      const snapshot = await articlesQuery.get();
      
      if (snapshot.empty) return [];
      
      return serializeArticles(snapshot.docs.map(doc => this.serializeDocument(doc)));
    } catch (error) {
      console.error("Error getting recent changes:", error);
      throw error;
    }
  }
  
  async getRandomArticle() {
    try {
      // Get total count
      const countSnapshot = await this.collection.count().get();
      const count = countSnapshot.data().count;
      
      if (count === 0) return null;
      
      // Get random offset
      const randomOffset = Math.floor(Math.random() * count);
      
      // Get article at that offset
      const snapshot = await this.collection
        .orderBy("createdAt")
        .offset(randomOffset)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      return serializeArticle(this.serializeDocument(snapshot.docs[0]));
    } catch (error) {
      console.error("Error getting random article:", error);
      throw error;
    }
  }
  
  async incrementViewCount(articleId) {
    try {
      if (!articleId) return;
      
      const articleRef = this.collection.doc(articleId);
      
      await articleRef.update({
        viewCount: adminDb.FieldValue.increment(1)
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // Don't throw - non-critical operation
    }
  }
  
  async delete(articleId, userId) {
    try {
      if (!articleId || !userId) {
        throw new ValidationError("Missing required information");
      }
      
      // Get the article
      const articleRef = this.collection.doc(articleId);
      const articleSnap = await articleRef.get();
      
      if (!articleSnap.exists) {
        throw new NotFoundError("Article not found");
      }
      
      const articleData = articleSnap.data();
      const categories = articleData.categories || [];
      
      // Start a batch
      const batch = adminDb.batch();
      
      // Delete the article
      batch.delete(articleRef);
      
      // Update category counts
      for (const category of categories) {
        const normalizedCategory = normalizeString(category);
        const categoryRef = adminDb.collection("categories").doc(normalizedCategory);
        
        batch.update(categoryRef, {
          articleCount: adminDb.FieldValue.increment(-1),
          updatedAt: adminDb.FieldValue.serverTimestamp()
        });
      }
      
      // Create a deletion record
      const deletionRef = adminDb.collection("deletions").doc();
      const deletionData = {
        articleId,
        title: articleData.title,
        deletedBy: userId,
        deletedAt: adminDb.FieldValue.serverTimestamp(),
        categories
      };
      
      batch.set(deletionRef, deletionData);
      
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting article:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const articleRepository = new ArticleRepository();