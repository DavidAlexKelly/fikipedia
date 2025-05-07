// src/hooks/data/useCategory.js
'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getArticlesByCategory, 
  getCategoryInfo, 
  getAllCategories 
} from '@/actions/categoryActions';

/**
 * Hook for fetching articles by category
 */
export function useArticlesByCategory(category, options = {}) {
  return useQuery({
    queryKey: ['category', category],
    queryFn: () => getArticlesByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for fetching category information
 */
export function useCategoryInfo(category, options = {}) {
  return useQuery({
    queryKey: ['categoryInfo', category],
    queryFn: () => getCategoryInfo(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for fetching all categories
 */
export function useAllCategories(options = {}) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
}