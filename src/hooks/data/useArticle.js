'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for fetching an article by title
 * @param {string} title - Article title
 * @returns {Object} Query result object
 */
export function useArticle(title) {
  return useQuery({
    queryKey: ['article', title],
    queryFn: async () => {
      if (!title) return null;
      const response = await fetch(`/api/articles/${encodeURIComponent(title)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error fetching article: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!title,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching article revisions
 * @param {string} articleId - Article ID
 * @returns {Object} Query result object
 */
export function useArticleRevisions(articleId) {
  return useQuery({
    queryKey: ['articleRevisions', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      const response = await fetch(`/api/articles/${articleId}/revisions`);
      if (!response.ok) {
        throw new Error(`Error fetching revisions: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!articleId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook for creating a new article
 * @returns {Object} Mutation result object
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (articleData) => {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create article');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['article', data.title] });
      queryClient.invalidateQueries({ queryKey: ['recentChanges'] });
      queryClient.invalidateQueries({ queryKey: ['siteStats'] });
      
      // If categories are specified, invalidate those too
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach(category => {
          queryClient.invalidateQueries({ queryKey: ['category', category] });
        });
      }
    },
  });
}

/**
 * Hook for updating an article
 * @returns {Object} Mutation result object
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, updates, summary }) => {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates, summary }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update article');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate article query
      queryClient.invalidateQueries({ queryKey: ['article', data.title] });
      queryClient.invalidateQueries({ queryKey: ['article', data.id] });
      
      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ['articleRevisions', data.id] });
      queryClient.invalidateQueries({ queryKey: ['recentChanges'] });
      
      // If categories were updated
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach(category => {
          queryClient.invalidateQueries({ queryKey: ['category', category] });
        });
      }
    },
  });
}