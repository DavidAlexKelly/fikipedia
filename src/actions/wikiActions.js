// src/actions/wikiActions.js
'use server'

import { wikiRepository } from '@/repositories/wikiRepository';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions'
import { AuthError } from '@/lib/errors/appErrors';

/**
 * Get recent changes
 * @param {number} limit - Maximum number of changes to return
 * @returns {Promise<Array>} Array of recent changes
 */
export async function getRecentChanges(limit = 50) {
  return wikiRepository.getRecentChanges(limit);
}

/**
 * Get site statistics
 * @returns {Promise<Object>} Site statistics
 */
export async function getSiteStats() {
  return wikiRepository.getSiteStats();
}

/**
 * Get featured content
 * @param {number} limit - Maximum number of featured items to return
 * @returns {Promise<Object>} Featured content
 */
export async function getFeaturedContent(limit = 5) {
  return wikiRepository.getFeaturedContent(limit);
}

/**
 * Submit feedback about the wiki
 * @param {Object} feedbackData - Feedback data
 * @returns {Promise<Object>} Result
 */
export async function submitFeedback(feedbackData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  
  return wikiRepository.submitFeedback(feedbackData, userId);
}

/**
 * Get site announcements
 * @returns {Promise<Array>} Array of announcements
 */
export async function getAnnouncements() {
  return wikiRepository.getAnnouncements();
}