// src/hooks/data/useUser.js
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserProfile, 
  getCurrentUserProfile,
  updateUserProfile, 
  getUserContributions,
  toggleWatchArticle,
  getWatchedArticles
} from '@/actions/userActions';

/**
 * Hook for fetching user profile
 */
export function useUserProfile(userId) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userId ? getUserProfile(userId) : getCurrentUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', data.id] });
    },
  });
}

/**
 * Hook for fetching user contributions
 */
export function useUserContributions(userId, options = {}) {
  return useQuery({
    queryKey: ['userContributions', userId],
    queryFn: () => getUserContributions(userId, options.limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
}

/**
 * Hook for toggling article watch status
 */
export function useToggleWatchArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ articleId }) => toggleWatchArticle(articleId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['watchedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.articleId] });
    },
  });
}

/**
 * Hook for fetching watched articles
 */
export function useWatchedArticles() {
  return useQuery({
    queryKey: ['watchedArticles'],
    queryFn: getWatchedArticles,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}