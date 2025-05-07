// src/actions/authActions.js
'use server'

import { userRepository } from '@/repositories/userRepository';
import { ValidationError, AuthError } from '@/lib/errors/appErrors';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions'

/**
 * Get user profile by Firebase UID
 * @param {string} uid - Firebase UID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export async function getUserProfile(uid) {
  if (!uid) {
    throw new ValidationError("User ID is required");
  }
  
  return userRepository.findByUid(uid);
}

/**
 * Get the current authenticated user's profile
 * @returns {Promise<Object|null>} User profile or null if not authenticated
 */
export async function getCurrentUserProfile() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return userRepository.findByUid(session.user.id);
}

/**
 * Synchronize session user with Firebase
 * @returns {Promise<Object|null>} Synchronized user profile
 */
export async function syncSessionUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  return userRepository.syncWithFirebaseAuth(session);
}

/**
 * Check if the current user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * Check if the current user has admin privileges
 * @returns {Promise<boolean>} True if admin
 */
export async function isAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }
  
  const userProfile = await userRepository.findByUid(session.user.id);
  return userProfile?.isAdmin === true;
}