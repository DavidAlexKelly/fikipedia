// src/hooks/data/useArticle.js
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getArticleByTitle, 
  createArticle, 
  updateArticle,
  getArticleRevisions
} from '@/actions/articleActions';

/**
 * Hook for fetching an article by title
 */
export function useArticle(title) {
  return useQuery({
    queryKey: ['article', title],
    queryFn: () => getArticleByTitle(title),
    enabled: !!title,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a new article
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createArticle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article', data.title] });
      queryClient.invalidateQueries({ queryKey: ['recentChanges'] });
      queryClient.invalidateQueries({ queryKey: ['siteStats'] });
    },
  });
}

/**
 * Hook for updating an article
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, updates, summary }) => {
      return updateArticle(articleId, updates, summary);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article', data.title] });
      queryClient.invalidateQueries({ queryKey: ['article', data.id] });
      queryClient.invalidateQueries({ queryKey: ['articleRevisions', data.id] });
      queryClient.invalidateQueries({ queryKey: ['recentChanges'] });
    },
  });
}

/**
 * Hook for fetching article revisions
 */
export function useArticleRevisions(articleId) {
  return useQuery({
    queryKey: ['articleRevisions', articleId],
    queryFn: () => getArticleRevisions(articleId),
    enabled: !!articleId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}