// src/repositories/authRepository.js
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export class AuthRepository {
  async getUserProfile(uid) {
    try {
      if (!uid) return null;
      
      // Try to get user from Firebase Auth
      const firebaseUser = await adminAuth.getUser(uid);
      
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
}

export const authRepository = new AuthRepository();