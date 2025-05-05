'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Hook for searching articles
 * @param {string} query - Search query
 * @param {number} [limit=20] - Maximum number of results
 * @returns {Object} Query result object
 */
export function useSearchArticles(query, limit = 20) {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Error searching articles: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!query && query.length >= 2, // Only search if query is at least 2 chars
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for searching articles using Algolia with advanced features
 * @param {string} query - Search query
 * @param {Object} options - Search options (page, hitsPerPage, filters)
 * @returns {Object} Query result object
 */
export function useSearch(query, options = {}) {
  const { page = 0, hitsPerPage = 10, filters = '' } = options;
  
  return useQuery({
    queryKey: ['algoliaSearch', query, options],
    queryFn: async () => {
      if (!query || query.length < 2) return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
      
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        hitsPerPage: hitsPerPage.toString(),
      });
      
      if (filters) {
        params.append('filters', filters);
      }
      
      const response = await fetch(`/api/search/algolia?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error searching with Algolia: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true, // Keep previous results while loading new ones (for pagination)
  });
}