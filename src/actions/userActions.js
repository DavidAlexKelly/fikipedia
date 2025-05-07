// src/actions/userActions.js
'use server'

import { userRepository } from '@/repositories/userRepository';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get current user profile
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
 */
export async function getUserProfile(userId) {
  return userRepository.findByUid(userId);
}

/**
 * Update current user profile
 */
export async function updateUserProfile(updates) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  
  const result = await userRepository.update(session.user.id, updates);
  
  // Revalidate cache
  revalidatePath('/profile');
  revalidateTag('user-profile');
  
  return result;
}

/**
 * Get user contributions
 */
export async function getUserContributions(userId, limit = 50) {
  if (!userId) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    userId = session.user.id;
  }
  
  return userRepository.getContributions(userId, limit);
}

/**
 * Toggle article watch status
 */
export async function toggleWatchArticle(articleId) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  
  const result = await userRepository.toggleWatchArticle(session.user.id, articleId);
  
  // Revalidate cache
  revalidatePath('/profile');
  revalidateTag('watched-articles');
  
  return { isWatching: result };
}

/**
 * Get watched articles
 */
export async function getWatchedArticles() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }
  
  return userRepository.getWatchedArticles(session.user.id);
}