// /services/server/categoryService.js
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString, serializeDate } from '../shared/utils';

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
export async function getAllCategories() {
  try {
    const categoriesRef = adminDb.collection('categories');
    const snapshot = await categoriesRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        normalizedName: data.normalizedName,
        articleCount: data.articleCount || 0,
        updatedAt: serializeDate(data.updatedAt)
      };
    });
    
    return categories;
  } catch (error) {
    console.error("Server error getting all categories:", error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get articles by category
 * @param {string} category - Category name
 * @param {number} limit - Maximum number of articles to return
 * @returns {Promise<Array>} Array of articles in the category
 */
export async function getArticlesByCategory(category, limit = 50) {
  if (!category) return [];
  
  try {
    // Normalize category name
    const normalizedCategory = normalizeString(category);
    
    // Check if category exists
    const categoryRef = adminDb.collection('categories').doc(normalizedCategory);
    const categoryDoc = await categoryRef.get();
    
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
    
    const articles = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        categories: data.categories || [],
        lastModified: serializeDate(data.lastModified),
        lastEditor: data.lastEditor,
        createdAt: serializeDate(data.createdAt),
        createdBy: data.createdBy,
        viewCount: data.viewCount || 0
      };
    });
    
    return articles;
  } catch (error) {
    console.error("Server error getting articles by category:", error);
    throw new Error('Failed to fetch articles by category');
  }
}

/**
 * Get category information
 * @param {string} category - Category name
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getCategoryInfo(category) {
  if (!category) return null;
  
  try {
    // Normalize category name
    const normalizedCategory = normalizeString(category);
    
    // Get category document
    const categoryRef = adminDb.collection('categories').doc(normalizedCategory);
    const categoryDoc = await categoryRef.get();
    
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
    console.error("Server error getting category info:", error);
    throw new Error('Failed to fetch category information');
  }
}