// src/repositories/categoryRepository.js
import { BaseRepository } from './baseRepository';
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString, serializeDate } from '@/lib/serializers';
import { ValidationError, NotFoundError } from '@/lib/errors/appErrors';

export class CategoryRepository extends BaseRepository {
  constructor() {
    super('categories');
  }
  
  async getAllCategories() {
    try {
      const snapshot = await this.collection.get();
      
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
      if (!category) return [];
      
      // Normalize category name
      const normalizedCategory = normalizeString(category);
      
      // Check if category exists
      const categoryDoc = await this.collection.doc(normalizedCategory).get();
      
      if (!categoryDoc.exists) {
        return []; // Category doesn't exist
      }
      
      // Query articles in this category
      const articlesQuery = adminDb.collection('articles')
        .where('categories', 'array-contains', category)
        .orderBy('lastModified', 'desc')
        .limit(limit);
      
      const snapshot = await articlesQuery.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content?.substring(0, 200) || '',
          categories: data.categories || [],
          lastModified: serializeDate(data.lastModified),
          lastEditor: data.lastEditor,
          createdAt: serializeDate(data.createdAt),
          createdBy: data.createdBy,
          viewCount: data.viewCount || 0
        };
      });
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
      
      // Get category document
      const categoryDoc = await this.collection.doc(normalizedCategory).get();
      
      if (!categoryDoc.exists) {
        return null;
      }
      
      const data = categoryDoc.data();
      
      return {
        id: categoryDoc.id,
        name: data.name,
        normalizedName: data.normalizedName,
        articleCount: data.articleCount || 0,
        updatedAt: serializeDate(data.updatedAt)
      };
    } catch (error) {
      console.error("Error getting category info:", error);
      throw error;
    }
  }
  
  async createCategory(categoryName) {
    try {
      if (!categoryName) {
        throw new ValidationError("Category name is required");
      }
      
      const normalizedName = normalizeString(categoryName);
      const categoryRef = this.collection.doc(normalizedName);
      
      // Check if category already exists
      const categoryDoc = await categoryRef.get();
      
      if (categoryDoc.exists) {
        return this.serializeDocument(categoryDoc);
      }
      
      // Create new category
      const categoryData = {
        name: categoryName,
        normalizedName,
        articleCount: 0,
        updatedAt: adminDb.FieldValue.serverTimestamp()
      };
      
      await categoryRef.set(categoryData);
      
      const newCategoryDoc = await categoryRef.get();
      return this.serializeDocument(newCategoryDoc);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }
  
  async incrementArticleCount(categoryName) {
    try {
      if (!categoryName) return;
      
      const normalizedName = normalizeString(categoryName);
      const categoryRef = this.collection.doc(normalizedName);
      
      await categoryRef.update({
        articleCount: adminDb.FieldValue.increment(1),
        updatedAt: adminDb.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Error incrementing article count:", error);
      throw error;
    }
  }
  
  async decrementArticleCount(categoryName) {
    try {
      if (!categoryName) return;
      
      const normalizedName = normalizeString(categoryName);
      const categoryRef = this.collection.doc(normalizedName);
      
      await categoryRef.update({
        articleCount: adminDb.FieldValue.increment(-1),
        updatedAt: adminDb.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Error decrementing article count:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const categoryRepository = new CategoryRepository();