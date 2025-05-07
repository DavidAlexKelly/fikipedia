// src/hooks/data/useSearch.js
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { searchArticles } from '@/actions/searchActions';

/**
 * Hook for basic search with React Query
 */
export function useSearch(query, options = {}) {
  return useQuery({
    queryKey: ['search', query, options],
    queryFn: () => searchArticles(query, options.limit || 10),
    enabled: !!query && query.length >= 2,
    ...options
  });
}

/**
 * Hook for search with mutation pattern (for autocomplete)
 */
export function useSearchArticles() {
  const [results, setResults] = useState([]);
  
  const mutation = useMutation({
    mutationFn: async (query) => {
      if (!query || query.length < 2) return [];
      return searchArticles(query, 5); // Limit to 5 for autocomplete
    },
    onSuccess: (data) => {
      setResults(data || []);
    }
  });
  
  return {
    search: mutation.mutate,
    data: results,
    isPending: mutation.isPending,
    error: mutation.error
  };
}