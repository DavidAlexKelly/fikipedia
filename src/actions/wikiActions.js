// src/actions/wikiActions.js
'use server'

import { wikiRepository } from '@/repositories/wikiRepository';

/**
 * Get site statistics
 */
export async function getSiteStats() {
  return wikiRepository.getSiteStats();
}

/**
 * Get all categories
 */
export async function getAllCategories() {
  return wikiRepository.getAllCategories();
}