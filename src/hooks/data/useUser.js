'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for fetching user profile
 * @param {string} userId - Firebase UID (optional - uses current session if not provided)
 * @returns {Object} Query result object
 */
export function useUserProfile(userId) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const endpoint = userId ? `/api/users/${userId}` : '/api/users/me';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error fetching user profile: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!userId || typeof window !== 'undefined', // Only run if userId is provided or we're on client
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching user contributions
 * @param {string} userId - Firebase UID (optional - uses current session if not provided)
 * @param {number} limit - Maximum number of contributions to return
 * @returns {Object} Query result object
 */
export function useUserContributions(userId, limit = 50) {
  return useQuery({
    queryKey: ['userContributions', userId, limit],
    queryFn: async () => {
      const endpoint = userId 
        ? `/api/users/${userId}/contributions?limit=${limit}`
        : `/api/users/me/contributions?limit=${limit}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error fetching user contributions: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!userId || typeof window !== 'undefined', // Only run if userId is provided or we're on client
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for updating user profile
 * @returns {Object} Mutation result object
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates) => {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['userProfile', data.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', 'me'] });
    },
  });
}

/**
 * Hook for toggling article watch status
 * @returns {Object} Mutation result object
 */
export function useToggleWatchArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId }) => {
      const response = await fetch(`/api/users/me/watch/${articleId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle watch status');
      }
      
      const result = await response.json();
      return result.isWatching;
    },
    onSuccess: (_, variables) => {
      // Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      // Invalidate watched articles query
      queryClient.invalidateQueries({ queryKey: ['watchedArticles'] });
      
      // Invalidate article query to update UI
      queryClient.invalidateQueries({ queryKey: ['article', variables.articleId] });
    },
  });
}

/**
 * Hook for fetching watched articles
 * @returns {Object} Query result object
 */
export function useWatchedArticles() {
  return useQuery({
    queryKey: ['watchedArticles'],
    queryFn: async () => {
      const response = await fetch('/api/users/me/watched');
      
      if (!response.ok) {
        throw new Error(`Error fetching watched articles: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}