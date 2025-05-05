'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Hook for fetching a random article
 * @returns {Object} Query result object
 */
export function useRandomArticle() {
  return useQuery({
    queryKey: ['randomArticle'],
    queryFn: async () => {
      const response = await fetch('/api/articles/random');
      
      if (!response.ok) {
        throw new Error(`Error fetching random article: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 0, // Always refetch for true randomness
    cacheTime: 0, // Don't cache results
    retry: false, // Don't retry on failure
  });
}