'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Hook for fetching articles in a specific category
 * @param {string} category - Category name
 * @returns {Object} Query result object
 */
export function useArticlesByCategory(category) {
  return useQuery({
    queryKey: ['category', category],
    queryFn: async () => {
      if (!category) return [];
      const response = await fetch(`/api/categories/${encodeURIComponent(category)}/articles`);
      if (!response.ok) {
        throw new Error(`Error fetching category articles: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching all categories
 * @returns {Object} Query result object
 */
export function useAllCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}