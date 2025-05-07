// src/repositories/userRepository.js - FIXED VERSION
import { BaseRepository } from './baseRepository';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { serializeDate } from '@/lib/serializers';
import { AuthError, NotFoundError, ValidationError } from '@/lib/errors/appErrors';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }
  
  /**
   * Find user by Firebase UID - Single source of truth for user lookup
   * @param {string} uid - Firebase UID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByUid(uid) {
    try {
      if (!uid) return null;
      
      // Get the base information from Firestore
      const userQuery = this.collection
        .where("uid", "==", uid)
        .limit(1);
      
      const snapshot = await userQuery.get();
      
      // If we don't have a record, try to get from Firebase Auth
      if (snapshot.empty) {
        try {
          // Try to get user from Firebase Auth as fallback
          const firebaseUser = await adminAuth.getUser(uid);
          if (firebaseUser) {
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              // Add minimum default fields
              watchlist: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
          }
          return null;
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            return null;
          }
          throw error;
        }
      }
      
      const userData = this.serializeDocument(snapshot.docs[0]);
      return userData;
    } catch (error) {
      console.error(`Error finding user by UID: ${error}`);
      throw error;
    }
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByEmail(email) {
    try {
      if (!email) return null;
      
      // First try to get user from Firebase Auth
      try {
        const firebaseUser = await adminAuth.getUserByEmail(email);
        if (firebaseUser) {
          // Use the UID to find the full profile
          return this.findByUid(firebaseUser.uid);
        }
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          return null;
        }
        throw error;
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding user by email: ${error}`);
      throw error;
    }
  }
  
  /**
   * Create or update user from auth provider data
   * @param {Object} authData - Auth provider data
   * @returns {Promise<Object>} Created user
   */
  async createOrUpdateFromAuth(authData) {
    try {
      if (!authData?.uid && !authData?.email) {
        throw new ValidationError("User ID or email is required");
      }
      
      // Try to find existing user
      let user = null;
      if (authData.uid) {
        user = await this.findByUid(authData.uid);
      } else if (authData.email) {
        user = await this.findByEmail(authData.email);
      }
      
      // If user exists AND has a valid Firestore document ID, update last login
      if (user && user.id) {
        const userDocRef = this.collection.doc(user.id);
        
        await userDocRef.update({
          lastLogin: adminDb.FieldValue.serverTimestamp(),
          updatedAt: adminDb.FieldValue.serverTimestamp()
        });
        
        // Get updated user
        const updatedDoc = await userDocRef.get();
        return this.serializeDocument(updatedDoc);
      }
      
      // Create new user
      const newUserRef = this.collection.doc();
      
      const userData = {
        uid: authData.uid,
        email: authData.email,
        displayName: authData.displayName || authData.name,
        photoURL: authData.photoURL || authData.image,
        watchlist: [],
        settings: {
          emailNotifications: true,
          theme: 'light'
        },
        createdAt: adminDb.FieldValue.serverTimestamp(),
        updatedAt: adminDb.FieldValue.serverTimestamp(),
        lastLogin: adminDb.FieldValue.serverTimestamp()
      };
      
      await newUserRef.set(userData);
      
      // Get the created user
      const newUser = await newUserRef.get();
      return this.serializeDocument(newUser);
    } catch (error) {
      console.error(`Error creating/updating user from auth: ${error}`);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated user
   */
  async update(userId, updates) {
    try {
      if (!userId || !updates) {
        throw new ValidationError("Missing required information");
      }
      
      // Find user document
      const user = await this.findByUid(userId);
      if (!user) throw new NotFoundError("User not found");
      
      // Check if user has a valid Firestore document ID
      if (!user.id) {
        throw new ValidationError("User does not have a valid document ID");
      }
      
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
  
  /**
   * Toggle watching an article for a user
   * @param {string} userId - User ID
   * @param {string} articleId - Article ID
   * @returns {Promise<boolean>} New watch state (true if now watching)
   */
  async toggleWatchArticle(userId, articleId) {
    try {
      if (!userId || !articleId) {
        throw new ValidationError("Missing required information");
      }
      
      // Find user document
      const user = await this.findByUid(userId);
      if (!user) throw new NotFoundError("User not found");
      
      // Check if user has a valid Firestore document ID
      if (!user.id) {
        throw new ValidationError("User does not have a valid document ID");
      }
      
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
  
  /**
   * Get user contributions
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of contributions to return
   * @returns {Promise<Array>} Array of contributions
   */
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
  
  /**
   * Get watched articles for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of watched articles
   */
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
  
  /**
   * Create a user profile
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createProfile(userData) {
    try {
      if (!userData.uid) {
        throw new ValidationError("User ID is required");
      }
      
      // Check if profile already exists
      const existingUser = await this.findByUid(userData.uid);
      if (existingUser && existingUser.id) return existingUser;
      
      // Create new profile
      const newUserRef = this.collection.doc();
      
      const profileData = {
        uid: userData.uid,
        email: userData.email || null,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        watchlist: [],
        settings: userData.settings || {
          emailNotifications: true,
          theme: 'light'
        },
        createdAt: adminDb.FieldValue.serverTimestamp(),
        updatedAt: adminDb.FieldValue.serverTimestamp(),
        lastLogin: adminDb.FieldValue.serverTimestamp()
      };
      
      await newUserRef.set(profileData);
      
      // Get the created profile
      const newProfile = await newUserRef.get();
      return this.serializeDocument(newProfile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }
  
  /**
   * Update user's last login timestamp
   * @param {string} userId - User ID
   */
  async updateLastLogin(userId) {
    try {
      if (!userId) return;
      
      const user = await this.findByUid(userId);
      if (!user || !user.id) return;
      
      const userDocRef = this.collection.doc(user.id);
      
      await userDocRef.update({
        lastLogin: adminDb.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating last login:", error);
      // Don't throw - this is a non-critical operation
    }
  }
  
  /**
   * Sync user with Firebase Auth
   * @param {Object} session - NextAuth session
   * @returns {Promise<Object>} Synced user
   */
  async syncWithFirebaseAuth(session) {
    try {
      if (!session?.user?.email) {
        throw new ValidationError("User email is required");
      }
      
      // Try to get user from Firebase Auth
      let firebaseUser;
      try {
        firebaseUser = await adminAuth.getUserByEmail(session.user.email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create the user in Firebase Auth
          firebaseUser = await adminAuth.createUser({
            email: session.user.email,
            displayName: session.user.name,
            photoURL: session.user.image,
            emailVerified: true,
          });
        } else {
          throw error;
        }
      }
      
      // Now create or update the user profile
      return this.createOrUpdateFromAuth({
        uid: firebaseUser.uid,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      });
    } catch (error) {
      console.error(`Error syncing with Firebase Auth: ${error}`);
      throw error;
    }
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();