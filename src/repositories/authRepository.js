// src/repositories/authRepository.js - REFACTORED VERSION
import { adminAuth } from '@/lib/firebase/admin';
import { ValidationError } from '@/lib/errors/appErrors';
import { userRepository } from './userRepository';

export class AuthRepository {
  /**
   * Get user by email - uses Firebase Auth
   * @param {string} email - User email
   */
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
  
  /**
   * Create user in Firebase Auth
   * @param {Object} userData - User data
   */
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
  
  /**
   * Get user profile - Defers to userRepository
   * @param {string} uid - Firebase UID
   */
  async getUserProfile(uid) {
    return userRepository.findByUid(uid);
  }
  
  /**
   * Sync user with Firebase Auth - Defers to userRepository
   * @param {Object} session - NextAuth session
   */
  async syncUserWithAuth(session) {
    return userRepository.syncWithFirebaseAuth(session);
  }
}

// Export a singleton instance
export const authRepository = new AuthRepository();