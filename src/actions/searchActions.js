// src/actions/searchActions.js
'use server'

import { searchRepository } from '@/repositories/searchRepository';
import { ValidationError } from '@/lib/errors/appErrors';

/**
 * Search articles using basic search
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Search results
 */
export async function searchArticles(query, limit = 20) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  return searchRepository.searchArticles(query, limit);
}

/**
 * Search using Algolia (if configured)
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Algolia search results
 */
export async function searchByAlgolia(query, options = {}) {
  if (!query || query.trim() === '') {
    return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
  }
  
  return searchRepository.searchByAlgolia(query, options);
}

/**
 * Get search suggestions
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise<Array>} Search suggestions
 */
export async function getSearchSuggestions(query, limit = 5) {
  if (!query || query.trim() === '' || query.trim().length < 2) {
    return [];
  }
  
  return searchRepository.getSearchSuggestions(query, limit);
}