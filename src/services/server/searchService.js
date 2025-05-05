// /services/server/searchService.js
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString, serializeDate } from '../shared/utils';
import algoliasearch from 'algoliasearch';

// Initialize Algolia (if configured)
let algoliaClient = null;
let algoliaIndex = null;

try {
  const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
  const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
  const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
  
  if (ALGOLIA_APP_ID && ALGOLIA_ADMIN_KEY && ALGOLIA_INDEX_NAME) {
    algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);
  }
} catch (error) {
  console.error('Failed to initialize Algolia:', error);
}

/**
 * Search articles using basic Firestore queries
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} Search results
 */
export async function searchArticles(query, limit = 20) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    const normalizedQuery = normalizeString(query);
    
    // Title prefix search
    const titleQuery = adminDb.collection('articles')
      .orderBy('normalizedTitle')
      .startAt(normalizedQuery)
      .endAt(normalizedQuery + '\uf8ff')
      .limit(limit);
    
    const titleSnapshot = await titleQuery.get();
    
    const results = [];
    
    // Process title matches
    titleSnapshot.docs.forEach(doc => {
      const data = doc.data();
      results.push({
        id: doc.id,
        title: data.title,
        content: data.content?.substring(0, 200) + '...',
        categories: data.categories || [],
        lastModified: serializeDate(data.lastModified),
        lastEditor: data.lastEditor,
        createdAt: serializeDate(data.createdAt),
        score: 1.0 // Title matches get high score
      });
    });
    
    // If we need more results, try content search (limited functionality in Firestore)
    if (results.length < limit) {
      // This is a simple approach - full text search is limited in Firestore
      // In production, you should use Algolia or Firebase's full-text search extensions
      const contentQuery = adminDb.collection('articles')
        .orderBy('lastModified', 'desc')
        .limit(100);
      
      const contentSnapshot = await contentQuery.get();
      
      // Basic content filtering
      const remainingLimit = limit - results.length;
      const existingIds = new Set(results.map(r => r.id));
      
      contentSnapshot.docs.forEach(doc => {
        // Skip if already in results
        if (existingIds.has(doc.id)) return;
        
        const data = doc.data();
        const content = data.content || '';
        
        // Simple check if content contains the query
        if (content.toLowerCase().includes(normalizedQuery)) {
          if (results.length < limit) {
            results.push({
              id: doc.id,
              title: data.title,
              content: getContentSnippet(content, normalizedQuery),
              categories: data.categories || [],
              lastModified: serializeDate(data.lastModified),
              lastEditor: data.lastEditor,
              createdAt: serializeDate(data.createdAt),
              score: 0.5 // Content matches get lower score
            });
          }
        }
      });
    }
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit);
  } catch (error) {
    console.error("Server error searching articles:", error);
    throw new Error('Failed to search articles');
  }
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
  
  if (!algoliaIndex) {
    throw new Error('Algolia is not configured');
  }
  
  try {
    const { hitsPerPage = 20, page = 0, filters = '' } = options;
    
    const result = await algoliaIndex.search(query, {
      hitsPerPage,
      page,
      filters,
      attributesToHighlight: ['title', 'content'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });
    
    return result;
  } catch (error) {
    console.error('Algolia search error:', error);
    throw new Error('Failed to search with Algolia');
  }
}

/**
 * Helper function to extract a content snippet around the query
 * @param {string} content - Full content
 * @param {string} query - Search query
 * @returns {string} Content snippet
 */
function getContentSnippet(content, query) {
  // Find the position of the query in the content
  const position = content.toLowerCase().indexOf(query.toLowerCase());
  
  if (position === -1) {
    // If query not found, return the beginning of the content
    return content.substring(0, 200) + '...';
  }
  
  // Extract a snippet around the query
  const start = Math.max(0, position - 100);
  const end = Math.min(content.length, position + query.length + 100);
  let snippet = content.substring(start, end);
  
  // Add ellipsis if needed
  if (start > 0) {
    snippet = '...' + snippet;
  }
  if (end < content.length) {
    snippet = snippet + '...';
  }
  
  return snippet;
}