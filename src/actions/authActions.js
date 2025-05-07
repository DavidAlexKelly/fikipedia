// src/actions/authActions.js
'use server'

import { authRepository } from '@/repositories/authRepository';
import { ValidationError, AuthError } from '@/lib/errors/appErrors';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get user profile by Firebase UID
 * @param {string} uid - Firebase UID
 */
export async function getUserProfile(uid) {
  if (!uid) {
    throw new ValidationError("User ID is required");
  }
  
  return authRepository.getUserProfile(uid);
}

/**
 * Get the current authenticated user's profile
 */
export async function getCurrentUserProfile() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return authRepository.getUserProfile(session.user.id);
}

/**
 * Synchronize session user with Firebase
 * Creates/updates Firebase Auth and Firestore records
 */
export async function syncSessionUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  return authRepository.syncUserWithAuth(session);
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
  
  const userProfile = await authRepository.getUserProfile(session.user.id);
  return userProfile?.isAdmin === true;
}