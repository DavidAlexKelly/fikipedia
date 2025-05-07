// src/actions/userActions.js
'use server'

import { userRepository } from '@/repositories/userRepository';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions'
import { AuthError, ValidationError } from '@/lib/errors/appErrors';

/**
 * Get current user profile
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
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export async function getUserProfile(userId) {
  return userRepository.findByUid(userId);
}

/**
 * Update current user profile
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateUserProfile(updates) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AuthError("Authentication required");
  }
  
  const result = await userRepository.update(session.user.id, updates);
  
  // Revalidate cache
  revalidatePath('/profile');
  revalidateTag('user-profile');
  
  return result;
}

/**
 * Get user contributions
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of contributions to return
 * @returns {Promise<Array>} Array of contributions
 */
export async function getUserContributions(userId, limit = 50) {
  if (!userId) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return [];
    }
    
    userId = session.user.id;
  }
  
  return userRepository.getContributions(userId, limit);
}

/**
 * Toggle article watch status
 * @param {string} articleId - Article ID
 * @returns {Promise<Object>} Result with isWatching flag
 */
export async function toggleWatchArticle(articleId) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AuthError("Authentication required");
  }
  
  const result = await userRepository.toggleWatchArticle(session.user.id, articleId);
  
  // Revalidate cache
  revalidatePath('/profile');
  revalidateTag('watched-articles');
  
  return { isWatching: result };
}

/**
 * Get watched articles
 * @returns {Promise<Array>} Array of watched articles
 */
export async function getWatchedArticles() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }
  
  return userRepository.getWatchedArticles(session.user.id);
}

/**
 * Create a user profile
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user profile
 */
export async function createUserProfile(userData) {
  if (!userData?.uid) {
    throw new ValidationError("User ID is required");
  }
  
  return userRepository.createProfile(userData);
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return;
  
  await userRepository.updateLastLogin(session.user.id);
}