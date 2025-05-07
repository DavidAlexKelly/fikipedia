// src/hooks/data/useRandom.js
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRandomArticle } from '@/actions/articleActions';

/**
 * Hook for fetching a random article
 */
export function useRandomArticle() {
  return useQuery({
    queryKey: ['randomArticle'],
    queryFn: getRandomArticle,
    staleTime: 0, // Always refetch for true randomness
    cacheTime: 0, // Don't cache results
    retry: false, // Don't retry on failure
  });
}