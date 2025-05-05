// src/services/api/auth.js
// Authentication-related API functions

/**
 * This module provides authentication functions for signing in and out
 */

import { isClient } from '../../lib/firebase/config';
import { clientAuth } from '../../lib/firebase/client';

// Import Firebase SDK methods
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  OAuthProvider
} from 'firebase/auth';

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object
 */
export async function signInWithGoogle() {
  if (!isClient || !clientAuth) {
    throw new Error('Authentication is only available client-side');
  }
  
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(clientAuth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

/**
 * Sign in with Apple
 * @returns {Promise<Object>} User object
 */
export async function signInWithApple() {
  if (!isClient || !clientAuth) {
    throw new Error('Authentication is only available client-side');
  }
  
  try {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(clientAuth, provider);
    return result.user;
  } catch (error) {
    console.error('Apple sign in error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (!isClient || !clientAuth) {
    throw new Error('Authentication is only available client-side');
  }
  
  try {
    await firebaseSignOut(clientAuth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}