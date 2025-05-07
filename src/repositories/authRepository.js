// src/repositories/authRepository.js
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { ValidationError, AuthError, NotFoundError } from '@/lib/errors/appErrors';

export class AuthRepository {
  async getUserByEmail(email) {
    try {
      if (!email) throw new ValidationError('Email is required');
      
      return adminAuth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      console.error('Error getting user by email:', error);
      throw error;
    }
  }
  
  async createUser(userData) {
    try {
      if (!userData.email) throw new ValidationError('Email is required');
      
      return adminAuth.createUser({
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        emailVerified: true,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  async getUserProfile(uid) {
    try {
      if (!uid) return null;
      
      // Try to get user from Firebase Auth
      let firebaseUser;
      try {
        firebaseUser = await adminAuth.getUser(uid);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          return null;
        }
        throw error;
      }
      
      // Also get additional profile data from Firestore
      const userQuery = adminDb.collection("users")
        .where("uid", "==", uid)
        .limit(1);
      
      const snapshot = await userQuery.get();
      let userData = null;
      
      if (!snapshot.empty) {
        userData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
          createdAt: snapshot.docs[0].data().createdAt?.toDate() || new Date(),
          updatedAt: snapshot.docs[0].data().updatedAt?.toDate() || new Date(),
          lastLogin: snapshot.docs[0].data().lastLogin?.toDate() || new Date()
        };
      }
      
      // Combine Firebase Auth and Firestore data
      return {
        ...firebaseUser,
        ...userData
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }
  
  async syncUserWithAuth(session) {
    try {
      if (!session?.user?.email) return null;
      
      // Try to get user from Firebase Auth
      let firebaseUser;
      try {
        firebaseUser = await adminAuth.getUserByEmail(session.user.email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create the user in Firebase Auth
          firebaseUser = await this.createUser({
            email: session.user.email,
            displayName: session.user.name,
            photoURL: session.user.image,
          });
        } else {
          throw error;
        }
      }
      
      // Find or create user profile in Firestore
      const userQuery = adminDb.collection("users")
        .where("uid", "==", firebaseUser.uid)
        .limit(1);
      
      const snapshot = await userQuery.get();
      
      if (snapshot.empty) {
        // Create new user profile
        const newUserRef = adminDb.collection("users").doc();
        
        const userData = {
          uid: firebaseUser.uid,
          email: session.user.email,
          displayName: session.user.name,
          photoURL: session.user.image,
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
        
        // Get the created profile
        const newProfile = await newUserRef.get();
        return {
          ...firebaseUser,
          ...newProfile.data(),
          id: newProfile.id
        };
      } else {
        // Update existing profile with login time
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({
          lastLogin: adminDb.FieldValue.serverTimestamp()
        });
        
        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
          lastLogin: new Date()
        };
        
        return {
          ...firebaseUser,
          ...userData
        };
      }
    } catch (error) {
      console.error("Error syncing user with auth:", error);
      return null;
    }
  }
}

export const authRepository = new AuthRepository();