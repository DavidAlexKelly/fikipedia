// src/services/api/search.js
// Search-related API functions

/**
 * This module provides search functionality using both Firebase and Algolia
 */

import { isClient } from '@/lib/firebase/config';
import { clientDb } from '@/lib/firebase/client';
import { validateSearchParams, normalizeString } from '@/services/helpers/validators';
import { serializeArticles } from '@/services/helpers/serializers';

// Import Algolia directly for client-side
import algoliasearch from 'algoliasearch/lite';

// Initialize Algolia client when on client side
let algoliaClient = null;
let algoliaIndex = null;

if (isClient) {
  try {
    const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
    const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;
    
    if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY && ALGOLIA_INDEX_NAME) {
      algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
      algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);
    }
  } catch (error) {
    console.error('Failed to initialize Algolia:', error);
  }
}

// Import Firebase SDK methods
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs,
  orderBy
} from 'firebase/firestore';

/**
 * Search articles using Algolia
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export async function searchByAlgolia(query, options = {}) {
  if (!query || query.trim() === '') {
    return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
  }
  
  // Validate search parameters
  const validation = validateSearchParams({ query, ...options });
  if (!validation.isValid) {
    throw new Error(`Invalid search parameters: ${validation.errors.join(', ')}`);
  }
  
  if (!isClient || !algoliaClient || !algoliaIndex) {
    console.warn('Algolia search is only available client-side or Algolia is not configured');
    return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
  }
  
  const { hitsPerPage = 20, page = 0, filters = '' } = options;
  
  try {
    console.log('Searching with Algolia:', query, options);
    const result = await algoliaIndex.search(query, {
      hitsPerPage,
      page,
      filters,
      attributesToHighlight: ['title', 'content'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });
    console.log('Algolia search results:', result);
    return result;
  } catch (error) {
    console.error('Algolia search error:', error);
    throw error;
  }
}

/**
 * Search articles using Firebase
 * @param {string} query - Search query
 * @param {number} [limit=20] - Maximum number of results to return
 * @returns {Promise<Array>} Search results
 */
export async function searchArticles(query, limit = 20) {
  if (!query || query.trim() === '' || !isClient || !clientDb) {
    return [];
  }
  
  // Validate search parameters
  const validation = validateSearchParams({ query });
  if (!validation.isValid) {
    throw new Error(`Invalid search parameters: ${validation.errors.join(', ')}`);
  }
  
  try {
    const normalizedQuery = normalizeString(query);
    
    // Try searching by title prefix first
    const titleQuery = query(
      collection(clientDb, "articles"),
      where("normalizedTitle", ">=", normalizedQuery),
      where("normalizedTitle", "<=", normalizedQuery + '\uf8ff'),
      limit(limit)
    );
    
    const titleSnapshot = await getDocs(titleQuery);
    
    const titleResults = titleSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastModified: doc.data().lastModified?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // If we have enough results, return them
    if (titleResults.length >= limit) {
      return serializeArticles(titleResults);
    }
    
    // Otherwise, try to find more results
    const contentQuery = query(
      collection(clientDb, "articles"),
      orderBy("lastModified", "desc"),
      limit(100) // Limit to prevent excessive reads
    );
    
    const contentSnapshot = await getDocs(contentQuery);
    
    // Filter articles by content
    const contentResults = contentSnapshot.docs
      .filter(doc => {
        const content = doc.data().content?.toLowerCase() || '';
        return content.includes(normalizedQuery) && 
               !titleResults.some(article => article.id === doc.id);
      })
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastModified: doc.data().lastModified?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }))
      .slice(0, limit - titleResults.length);
    
    // Combine results
    const combinedResults = [...titleResults, ...contentResults];
    return serializeArticles(combinedResults);
  } catch (error) {
    console.error('Firebase search error:', error);
    throw error;
  }
}