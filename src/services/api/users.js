// src/services/api/users.js
// User-related API functions

/**
 * This module provides all user-related operations including
 * profile management, contributions, and watchlist functionality
 */

import { isClient, isServer } from '@/lib/firebase/config';
import { clientDb } from '@/lib/firebase/client';
import { validateUser } from '@/services/helpers/validators';
import { serializeUser, serializeDocument } from '@/services/helpers/serializers';

// Import Firebase SDK methods
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  limit, 
  orderBy,
  serverTimestamp,
  documentId
} from 'firebase/firestore';

/**
 * Get user profile by Firebase UID
 * @param {string} userId - Firebase UID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export async function getUserProfile(userId) {
  if (!userId || !isClient || !clientDb) return null;
  
  try {
    const userQuery = query(
      collection(clientDb, "users"),
      where("uid", "==", userId),
      limit(1)
    );
    
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const userData = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
      createdAt: snapshot.docs[0].data().createdAt?.toDate() || new Date(),
      updatedAt: snapshot.docs[0].data().updatedAt?.toDate() || new Date(),
      lastLogin: snapshot.docs[0].data().lastLogin?.toDate() || new Date()
    };
    
    return serializeUser(userData);
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Create a new user profile (client-side stub)
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user profile
 */
export async function createUserProfile(userData) {
  if (!isClient || !clientDb) {
    throw new Error('User creation on client-side is not supported');
  }
  
  // This is just a stub - user creation should be handled by server functions
  // like NextAuth callbacks or serverless functions
  throw new Error("User creation must be handled server-side");
}

/**
 * Update user profile
 * @param {string} userId - Firebase UID
 * @param {Object} updates - Data to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, updates) {
  if (!userId || !updates || !isClient || !clientDb) {
    throw new Error("Missing required information or not in client context");
  }
  
  try {
    const userQuery = query(
      collection(clientDb, "users"),
      where("uid", "==", userId),
      limit(1)
    );
    
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      throw new Error("User not found");
    }
    
    const userDocRef = doc(clientDb, "users", snapshot.docs[0].id);
    
    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Update the document
    await updateDoc(userDocRef, updateData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Get user contributions
 * @param {string} userId - Firebase UID
 * @param {number} [limitCount=50] - Maximum number of contributions to return
 * @returns {Promise<Array>} Array of contributions
 */
export async function getUserContributions(userId, limitCount = 50) {
  if (!userId || !isClient || !clientDb) return [];
  
  try {
    // Get revisions by this user
    const revisionsQuery = query(
      collection(clientDb, "revisions"),
      where("editor", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount) // This is the issue - using limit as a function, not a variable
    );
    
    const revisionsSnapshot = await getDocs(revisionsQuery);
    
    if (revisionsSnapshot.empty) {
      return [];
    }
    
    const revisions = revisionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    
    // Batch fetch article titles for better performance
    const articleIds = [...new Set(revisions.map(rev => rev.articleId))];
    
    // Firebase limit is 10 for 'in' queries, so we need to chunk
    const articleTitles = {};
    const chunkSize = 10;
    
    for (let i = 0; i < articleIds.length; i += chunkSize) {
      const chunk = articleIds.slice(i, i + chunkSize);
      
      const articlesQuery = query(
        collection(clientDb, "articles"),
        where(documentId(), "in", chunk)
      );
      
      const articlesSnapshot = await getDocs(articlesQuery);
      articlesSnapshot.forEach(doc => {
        articleTitles[doc.id] = doc.data().title || "Unknown Article";
      });
    }
    
    // Add article titles to revisions
    const contributionsWithTitles = revisions.map(revision => ({
      ...revision,
      articleTitle: articleTitles[revision.articleId] || "Unknown Article"
    }));
    
    return contributionsWithTitles;
  } catch (error) {
    console.error("Error getting user contributions:", error);
    throw error;
  }
}

/**
 * Toggle watching an article
 * @param {string} userId - Firebase UID
 * @param {string} articleId - Article ID
 * @returns {Promise<boolean>} New watch state (true if now watching)
 */
export async function toggleWatchArticle(userId, articleId) {
  if (!userId || !articleId || !isClient || !clientDb) {
    throw new Error("Missing required information or not in client context");
  }
  
  try {
    const userQuery = query(
      collection(clientDb, "users"),
      where("uid", "==", userId),
      limit(1)
    );
    
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      throw new Error("User not found");
    }
    
    const userDocRef = doc(clientDb, "users", snapshot.docs[0].id);
    
    const userData = snapshot.docs[0].data();
    
    // Toggle article in watchlist
    let watchlist = userData.watchlist || [];
    const isWatched = watchlist.includes(articleId);
    
    if (isWatched) {
      // Remove from watchlist
      watchlist = watchlist.filter(id => id !== articleId);
    } else {
      // Add to watchlist
      watchlist.push(articleId);
    }
    
    // Update user document
    await updateDoc(userDocRef, {
      watchlist,
      updatedAt: serverTimestamp()
    });
    
    return !isWatched; // Return the new state (true if added, false if removed)
  } catch (error) {
    console.error("Error toggling watch status:", error);
    throw error;
  }
}

/**
 * Get watched articles
 * @param {string} userId - Firebase UID
 * @returns {Promise<Array>} Array of watched articles
 */
export async function getWatchedArticles(userId) {
  if (!userId || !isClient || !clientDb) return [];
  
  try {
    // Get user's watchlist
    const userQuery = query(
      collection(clientDb, "users"),
      where("uid", "==", userId),
      limit(1)
    );
    
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const userData = snapshot.docs[0].data();
    const watchlist = userData.watchlist || [];
    
    if (watchlist.length === 0) {
      return [];
    }
    
    // Batch get articles by chunks (Firebase limit is 10 for 'in' queries)
    const articles = [];
    const chunkSize = 10;
    
    for (let i = 0; i < watchlist.length; i += chunkSize) {
      const chunk = watchlist.slice(i, i + chunkSize);
      
      const articlesQuery = query(
        collection(clientDb, "articles"),
        where(documentId(), "in", chunk)
      );
      
      const articlesSnapshot = await getDocs(articlesQuery);
      const fetchedArticles = articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastModified: doc.data().lastModified?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      articles.push(...fetchedArticles);
    }
    
    return articles;
  } catch (error) {
    console.error("Error getting watched articles:", error);
    throw error;
  }
}