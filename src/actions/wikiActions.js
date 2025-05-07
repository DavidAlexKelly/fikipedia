// src/actions/wikiActions.js
'use server'

import { wikiRepository } from '@/repositories/wikiRepository';

/**
 * Get recent changes
 * @param {number} limit - Maximum number of changes to return
 */
export async function getRecentChanges(limit = 50) {
  return wikiRepository.getRecentChanges(limit);
}

/**
 * Get site statistics
 */
export async function getSiteStats() {
  return wikiRepository.getSiteStats();
}