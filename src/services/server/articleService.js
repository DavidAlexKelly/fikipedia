// /services/server/articleService.js
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString, serializeDate } from '../shared/utils';

/**
 * Get an article by title (server-side)
 * @param {string} title - Article title
 * @returns {Promise<Object|null>} Article object or null if not found
 */
export async function getArticleByTitle(title) {
  if (!title) return null;

  try {
    const normalizedTitle = normalizeString(title);
    
    const articlesRef = adminDb.collection('articles');
    const query = articlesRef.where('normalizedTitle', '==', normalizedTitle).limit(1);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      lastModified: serializeDate(data.lastModified),
      createdAt: serializeDate(data.createdAt)
    };
  } catch (error) {
    console.error("Server error getting article:", error);
    throw new Error('Failed to retrieve article');
  }
}

/**
 * Create a new article (server-side)
 * @param {Object} articleData - Article data
 * @param {string} userId - User ID of creator
 * @returns {Promise<Object>} Created article
 */
export async function createArticle(articleData, userId) {
  if (!articleData?.title || !userId) {
    throw new Error("Missing required information");
  }
  
  try {
    // Check if article with this title already exists
    const normalizedTitle = normalizeString(articleData.title);
    const existingQuery = adminDb.collection('articles')
      .where('normalizedTitle', '==', normalizedTitle)
      .limit(1);
    
    const existingSnapshot = await existingQuery.get();
    
    if (!existingSnapshot.empty) {
      throw new Error("An article with this title already exists");
    }
    
    // Start a transaction
    return await adminDb.runTransaction(async (transaction) => {
      // Create article reference
      const articlesRef = adminDb.collection('articles');
      const newArticleRef = articlesRef.doc();
      
      const categoryArray = articleData.categories || [];
      
      // Prepare article data
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
      
      // Create article
      transaction.set(newArticleRef, articleDocData);
      
      // Create initial revision
      const revisionsRef = adminDb.collection("revisions").doc();
      const revisionData = {
        articleId: newArticleRef.id,
        content: articleData.content || "",
        timestamp: adminDb.FieldValue.serverTimestamp(),
        editor: userId,
        summary: articleData.summary || "Initial creation",
        previousRevision: null
      };
      
      transaction.set(revisionsRef, revisionData);
      
      // Update category documents if needed
      for (const category of categoryArray) {
        const normalizedCategory = normalizeString(category);
        const categoryRef = adminDb.collection("categories").doc(normalizedCategory);
        
        // Get current category data
        const categoryDoc = await transaction.get(categoryRef);
        
        if (categoryDoc.exists) {
          // Update existing category
          transaction.update(categoryRef, {
            articleCount: adminDb.FieldValue.increment(1),
            updatedAt: adminDb.FieldValue.serverTimestamp()
          });
        } else {
          // Create new category
          transaction.set(categoryRef, {
            name: category,
            normalizedName: normalizedCategory,
            articleCount: 1,
            updatedAt: adminDb.FieldValue.serverTimestamp()
          });
        }
      }
      
      // Return the ID of the created article
      return {
        id: newArticleRef.id,
        title: articleData.title
      };
    });
  } catch (error) {
    console.error("Server error creating article:", error);
    throw new Error(error.message || 'Failed to create article');
  }
}

/**
 * Get a random article (server-side)
 * @returns {Promise<Object|null>} Random article or null if none found
 */
export async function getRandomArticle() {
    try {
      // Count total articles
      const countSnapshot = await adminDb.collection('articles').count().get();
      const count = countSnapshot.data().count;
      
      if (count === 0) {
        return null;
      }
      
      // Get a random offset
      const randomOffset = Math.floor(Math.random() * count);
      
      // Get the article at that offset
      const snapshot = await adminDb.collection('articles')
        .orderBy('createdAt')
        .offset(randomOffset)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        lastModified: serializeDate(data.lastModified),
        createdAt: serializeDate(data.createdAt)
      };
    } catch (error) {
      console.error("Server error getting random article:", error);
      throw new Error('Failed to get random article');
    }
  }