// /services/server/userService.js
import { adminDb } from '@/lib/firebase/admin';

/**
 * Toggle watching an article for a user
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID
 * @returns {Promise<boolean>} New watch state (true if now watching)
 */
export async function toggleWatchArticle(userId, articleId) {
  if (!userId || !articleId) {
    throw new Error("Missing required information");
  }
  
  try {
    const userQuery = adminDb.collection("users")
      .where("uid", "==", userId)
      .limit(1);
    
    const snapshot = await userQuery.get();
    
    if (snapshot.empty) {
      throw new Error("User not found");
    }
    
    const userDocRef = snapshot.docs[0].ref;
    const userData = snapshot.docs[0].data();
    
    // Toggle article in watchlist
    let watchlist = userData.watchlist || [];
    const isWatched = watchlist.includes(articleId);
    
    // Update watchlist
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

/**
 * Get user profile by Firebase UID
 * @param {string} userId - Firebase UID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  try {
    // Try to get user directly by document ID first
    const userDoc = await adminDb.collection("users").doc(userId).get();
    
    if (userDoc.exists) {
      const userData = {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: userDoc.data().updatedAt?.toDate() || new Date(),
        lastLogin: userDoc.data().lastLogin?.toDate() || new Date()
      };
      
      return userData;
    }
    
    // If not found by ID, try searching by uid field as fallback
    const userQuery = adminDb.collection("users")
      .where("uid", "==", userId)
      .limit(1);
    
    const snapshot = await userQuery.get();
    
    if (snapshot.empty) {
      console.log(`User with ID ${userId} not found`);
      return null;
    }
    
    const userData = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
      createdAt: snapshot.docs[0].data().createdAt?.toDate() || new Date(),
      updatedAt: snapshot.docs[0].data().updatedAt?.toDate() || new Date(),
      lastLogin: snapshot.docs[0].data().lastLogin?.toDate() || new Date()
    };
    
    return userData;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null; // Return null instead of throwing
  }
}

/**
 * Get user by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(userId) {
  if (!userId) return null;

  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: userDoc.data().updatedAt?.toDate() || new Date(),
      lastLogin: userDoc.data().lastLogin?.toDate() || new Date()
    };
    
    return userData;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

/**
 * Get user contributions
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of contributions to return
 * @returns {Promise<Array>} Array of contributions
 */
export async function getUserContributions(userId, limit = 50) {
  if (!userId) return [];
  
  // Ensure limit is a valid number
  const validLimit = typeof limit === 'number' && !isNaN(limit) ? limit : 50;
  
  try {
    // Get revisions by this user
    const revisionsQuery = adminDb.collection("revisions")
      .where("editor", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(validLimit);
    
    const revisionsSnapshot = await revisionsQuery.get();
    
    if (revisionsSnapshot.empty) {
      return [];
    }
    
    const revisions = revisionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    
    // Batch fetch article titles for better performance - alternative approach
    const articleIds = [...new Set(revisions.map(rev => rev.articleId))];
    const articleTitles = {};
    
    // Fetch each article individually instead of using 'in' query
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
    const contributionsWithTitles = revisions.map(revision => ({
      ...revision,
      articleTitle: articleTitles[revision.articleId] || "Unknown Article"
    }));
    
    return contributionsWithTitles;
  } catch (error) {
    console.error("Error getting user contributions:", error);
    return []; // Return empty array on error
  }
}