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

// Other user service methods would follow a similar pattern