// src/services/api/articles.js
// Article-related API functions

/**
 * This module provides all article-related operations including
 * getting, creating, and updating articles, plus working with
 * revisions, categories, and article lists
 */

import { isClient } from '../../lib/firebase/config';
import { clientDb } from '../../lib/firebase/client';
import { validateArticle, validateRevision, normalizeString } from '../helpers/validators';
import { serializeArticle, serializeArticles, serializeRevision, serializeRevisions } from '../helpers/serializers';

// Import Firebase SDK methods
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch,
  documentId
} from 'firebase/firestore';

// Cache for client-side operations
const articleCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Extracts article data from Firestore document
 * @param {Object} doc - Firestore document
 * @returns {Object} Article data
 */
const extractArticleData = (doc) => {
  if (!doc || !doc.exists) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    lastModified: data.lastModified?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date()
  };
};

/**
 * Extracts revision data from Firestore document
 * @param {Object} doc - Firestore document
 * @returns {Object} Revision data
 */
const extractRevisionData = (doc) => {
  if (!doc || !doc.exists) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate() || new Date()
  };
};

/**
 * Get an article by title (client-side)
 * @param {string} title - Article title
 * @returns {Promise<Object|null>} Article object or null if not found
 */
export async function getArticleByTitleClient(title) {
  if (!isClient || !clientDb || !title) return null;
  
  try {
    const normalizedTitle = normalizeString(title);
    
    // Check cache first
    const cacheKey = `article:${normalizedTitle}`;
    if (articleCache.has(cacheKey)) {
      const cachedData = articleCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData.data;
      }
      // Cache expired, remove it
      articleCache.delete(cacheKey);
    }
    
    const q = query(
      collection(clientDb, "articles"),
      where("normalizedTitle", "==", normalizedTitle),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const articleData = extractArticleData(querySnapshot.docs[0]);
    
    // Store in cache
    articleCache.set(cacheKey, {
      data: articleData,
      timestamp: Date.now()
    });
    
    return articleData;
  } catch (error) {
    console.error("Error getting article:", error);
    throw error;
  }
}

/**
 * Get an article by title (server-side stub for client-side)
 * @param {string} title - Article title
 * @returns {Promise<Object|null>} Article object or null if not found
 */
export async function getArticleByTitleServer(title) {
  // In client-side, redirect to client implementation
  if (isClient) {
    return getArticleByTitleClient(title);
  }
  
  // This should never execute on client-side
  console.warn('Server-side function called in client context');
  return null;
}

/**
 * Get an article by title (works in both client and server)
 * @param {string} title - Article title
 * @returns {Promise<Object|null>} Article object or null if not found
 */
export async function getArticleByTitle(title) {
  return getArticleByTitleClient(title);
}

/**
 * Create a new article
 * @param {Object} articleData - Article data
 * @param {string} userId - User ID of creator
 * @returns {Promise<string>} New article ID
 */
export async function createArticle(articleData, userId) {
  if (!isClient || !clientDb) {
    throw new Error('Database not initialized or not in client context');
  }
  
  if (!articleData?.title || !userId) {
    throw new Error("Missing required information");
  }
  
  // Validate article data
  const validation = validateArticle(articleData);
  if (!validation.isValid) {
    throw new Error(`Invalid article data: ${validation.errors.join(', ')}`);
  }
  
  try {
    // Check if article with this title already exists
    const existingArticle = await getArticleByTitle(articleData.title);
    if (existingArticle) {
      throw new Error("An article with this title already exists");
    }
    
    const batch = writeBatch(clientDb);
    const articlesRef = collection(clientDb, "articles");
    
    const revisionsRef = collection(clientDb, "revisions");
    
    // Create new article document
    const newArticleRef = doc(articlesRef);
    
    const categoryArray = articleData.categories || [];
    
    const articleDocData = {
      title: articleData.title,
      normalizedTitle: normalizeString(articleData.title),
      content: articleData.content || "",
      categories: categoryArray,
      createdAt: serverTimestamp(),
      createdBy: userId,
      lastModified: serverTimestamp(),
      lastEditor: userId,
      viewCount: 0,
      isRedirect: false
    };
    
    batch.set(newArticleRef, articleDocData);
    
    // Create initial revision document
    const newRevisionRef = doc(revisionsRef);
    
    const revisionDocData = {
      articleId: newArticleRef.id,
      content: articleData.content || "",
      timestamp: serverTimestamp(),
      editor: userId,
      summary: articleData.summary || "Initial creation",
      previousRevision: null
    };
    
    batch.set(newRevisionRef, revisionDocData);
    
    // Update category collections (if we track categories separately)
    for (const category of categoryArray) {
      const normalizedCategory = normalizeString(category);
      const categoryRef = doc(collection(clientDb, "categories"), normalizedCategory);
      
      // Use set with merge to ensure we don't overwrite existing category data
      batch.set(categoryRef, {
        name: category,
        normalizedName: normalizedCategory,
        articleCount: 1,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    // Commit the batch
    await batch.commit();
    
    // Clear cache for this article
    const cacheKey = `article:${normalizeString(articleData.title)}`;
    articleCache.delete(cacheKey);
    
    return newArticleRef.id;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

/**
 * Update an existing article
 * @param {string} articleId - Article ID
 * @param {Object} updates - Data to update
 * @param {string} userId - User ID making the update
 * @param {string} summary - Edit summary
 * @returns {Promise<string>} Article ID
 */
export async function updateArticle(articleId, updates, userId, summary) {
  if (!isClient || !clientDb) {
    throw new Error('Database not initialized or not in client context');
  }
  
  if (!articleId || !userId || !updates) {
    throw new Error("Missing required information");
  }
  
  try {
    // Get the article reference
    const articleRef = doc(clientDb, "articles", articleId);
    
    // Get the article data
    const articleSnap = await getDoc(articleRef);
    
    if (!articleSnap.exists()) {
      throw new Error("Article not found");
    }
    
    const articleData = articleSnap.data();
    const previousContent = articleData.content;
    const previousCategories = articleData.categories || [];
    
    // Get the latest revision for this article
    const revisionsQuery = query(
      collection(clientDb, "revisions"),
      where("articleId", "==", articleId),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const revisionSnapshot = await getDocs(revisionsQuery);
    
    const previousRevisionId = revisionSnapshot.empty 
      ? null 
      : revisionSnapshot.docs[0].id;
    
    // Start a batch write
    const batch = writeBatch(clientDb);
    
    // Update the article
    const updateData = {
      ...updates,
      lastModified: serverTimestamp(),
      lastEditor: userId
    };
    
    batch.update(articleRef, updateData);
    
    // Create a new revision
    const revisionsRef = collection(clientDb, "revisions");
    const newRevisionRef = doc(revisionsRef);
    
    const revisionData = {
      articleId: articleId,
      content: updates.content || previousContent,
      timestamp: serverTimestamp(),
      editor: userId,
      summary: summary || "Updated article",
      previousRevision: previousRevisionId
    };
    
    batch.set(newRevisionRef, revisionData);
    
    // Handle category changes if present
    if (updates.categories) {
      const newCategories = updates.categories;
      const categoriesAdded = newCategories.filter(cat => !previousCategories.includes(cat));
      const categoriesRemoved = previousCategories.filter(cat => !newCategories.includes(cat));
      
      // Update added categories
      for (const category of categoriesAdded) {
        const normalizedCategory = normalizeString(category);
        const categoryRef = doc(collection(clientDb, "categories"), normalizedCategory);
        
        batch.set(categoryRef, {
          name: category,
          normalizedName: normalizedCategory,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
    
    // Commit all the changes
    await batch.commit();
    
    // Clear cache
    const cacheKey = `article:${normalizeString(articleData.normalizedTitle)}`;
    articleCache.delete(cacheKey);
    
    return articleId;
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
}

/**
 * Get article revisions
 * @param {string} articleId - Article ID
 * @param {number} [limit=20] - Maximum number of revisions to return
 * @returns {Promise<Array>} Array of revisions
 */
export async function getArticleRevisions(articleId, limit = 20) {
  if (!isClient || !clientDb) {
    return [];
  }
  
  if (!articleId) return [];
  
  try {
    const revisionsQuery = query(
      collection(clientDb, "revisions"),
      where("articleId", "==", articleId),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    
    const snapshot = await getDocs(revisionsQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const revisions = snapshot.docs.map(doc => extractRevisionData(doc));
    return serializeRevisions(revisions);
  } catch (error) {
    console.error("Error getting article revisions:", error);
    throw error;
  }
}

/**
 * Get recent changes
 * @param {number} [limit=50] - Maximum number of changes to return
 * @returns {Promise<Array>} Array of recently changed articles
 */
export async function getRecentChanges(limit = 50) {
  if (!isClient || !clientDb) {
    return [];
  }
  
  try {
    const articlesQuery = query(
      collection(clientDb, "articles"),
      orderBy("lastModified", "desc"),
      limit(limit)
    );
    
    const snapshot = await getDocs(articlesQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const articles = snapshot.docs.map(doc => extractArticleData(doc));
    return serializeArticles(articles);
  } catch (error) {
    console.error("Error getting recent changes:", error);
    throw error;
  }
}

/**
 * Get articles by category
 * @param {string} category - Category name
 * @param {number} [limit=50] - Maximum number of articles to return
 * @returns {Promise<Array>} Array of articles in the category
 */
export async function getArticlesByCategory(category, limit = 50) {
  if (!isClient || !clientDb) {
    return [];
  }
  
  if (!category) return [];
  
  try {
    const articlesQuery = query(
      collection(clientDb, "articles"),
      where("categories", "array-contains", category),
      limit(limit)
    );
    
    const snapshot = await getDocs(articlesQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const articles = snapshot.docs.map(doc => extractArticleData(doc));
    return serializeArticles(articles);
  } catch (error) {
    console.error("Error getting articles by category:", error);
    throw error;
  }
}

/**
 * Get a random article
 * @returns {Promise<Object|null>} Random article or null if none found
 */
export async function getRandomArticle() {
  if (!isClient || !clientDb) {
    return null;
  }
  
  try {
    // For client, we'll just fetch a reasonable number of articles
    const articlesRef = collection(clientDb, "articles");
    const allArticlesQuery = query(articlesRef, limit(100));
    const allArticlesSnapshot = await getDocs(allArticlesQuery);
    
    if (allArticlesSnapshot.empty) {
      return null;
    }
    
    // Get a random index
    const randomIndex = Math.floor(Math.random() * allArticlesSnapshot.docs.length);
    const articleData = extractArticleData(allArticlesSnapshot.docs[randomIndex]);
    return serializeArticle(articleData);
  } catch (error) {
    console.error("Error getting random article:", error);
    throw error;
  }
}

/**
 * Get site statistics
 * @returns {Promise<Object>} Site statistics
 */
export async function getSiteStats() {
  if (!isClient || !clientDb) {
    return {
      articleCount: 0,
      userCount: 0,
      revisionCount: 0,
      imageCount: 0
    };
  }
  
  try {
    // Since client-side can't do proper count queries,
    // we'll do limited queries and get the size
    const [articlesSnapshot, usersSnapshot, revisionsSnapshot] = await Promise.all([
      getDocs(query(collection(clientDb, "articles"), limit(1000))),
      getDocs(query(collection(clientDb, "users"), limit(1000))),
      getDocs(query(collection(clientDb, "revisions"), limit(1000)))
    ]);
    
    return {
      articleCount: articlesSnapshot.size,
      userCount: usersSnapshot.size,
      revisionCount: revisionsSnapshot.size,
      imageCount: 0 // Placeholder
    };
  } catch (error) {
    console.error("Error getting site stats:", error);
    return {
      articleCount: 0,
      userCount: 0,
      revisionCount: 0,
      imageCount: 0
    };
  }
}

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
export async function getAllCategories() {
  if (!isClient || !clientDb) {
    return [];
  }
  
  try {
    const snapshot = await getDocs(collection(clientDb, "categories"));
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Error getting all categories:", error);
    throw error;
  }
}