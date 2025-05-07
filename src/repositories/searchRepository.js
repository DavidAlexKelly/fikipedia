// src/repositories/searchRepository.js
import { BaseRepository } from './baseRepository';
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString } from '@/lib/serializers';
import { ValidationError } from '@/lib/errors/appErrors';

export class SearchRepository extends BaseRepository {
  constructor() {
    super('articles'); // Using articles collection as base
  }
  
  async searchArticles(query, limit = 20) {
    if (!query || query.trim() === '') {
      return [];
    }
    
    try {
      const normalizedQuery = normalizeString(query);
      
      // Title prefix search
      const titleQuerySnapshot = await this.collection
        .orderBy('normalizedTitle')
        .startAt(normalizedQuery)
        .endAt(normalizedQuery + '\uf8ff')
        .limit(limit)
        .get();
      
      const results = titleQuerySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content?.substring(0, 200) || '',
          lastModified: data.lastModified?.toDate()?.toISOString() || new Date().toISOString(),
          categories: data.categories || []
        };
      });
      
      // If we didn't get enough results, try to find more
      if (results.length < limit) {
        // This is a simplistic approach - in a real app, you'd use a proper search service
        const contentQuerySnapshot = await this.collection
          .orderBy('lastModified', 'desc')
          .limit(100)
          .get();
        
        // Filter locally for content matches
        const contentMatches = contentQuerySnapshot.docs
          .filter(doc => {
            // Skip if already in results
            if (results.some(r => r.id === doc.id)) return false;
            
            const data = doc.data();
            const content = data.content || '';
            return content.toLowerCase().includes(normalizedQuery);
          })
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              content: data.content?.substring(0, 200) || '',
              lastModified: data.lastModified?.toDate()?.toISOString() || new Date().toISOString(),
              categories: data.categories || []
            };
          })
          .slice(0, limit - results.length);
        
        // Combine results
        results.push(...contentMatches);
      }
      
      return results;
    } catch (error) {
      console.error("Error searching articles:", error);
      throw new Error('Failed to search articles');
    }
  }
  
  async searchByAlgolia(query, options = {}) {
    if (!query || query.trim() === '') {
      return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
    }
    
    try {
      // Check if Algolia is configured
      if (!process.env.ALGOLIA_APP_ID || 
          !process.env.ALGOLIA_ADMIN_KEY || 
          !process.env.ALGOLIA_INDEX_NAME) {
        throw new Error('Algolia is not configured');
      }
      
      // Import Algolia here to avoid issues if not configured
      const algoliasearch = require('algoliasearch');
      
      const algoliaClient = algoliasearch(
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_ADMIN_KEY
      );
      const algoliaIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME);
      
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
}

// Export a singleton instance
export const searchRepository = new SearchRepository();