'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Hook for fetching recent changes
 * @param {number} limit - Maximum number of results to return
 * @returns {Object} Query result object
 */
export function useRecentChanges(limit = 50) {
  return useQuery({
    queryKey: ['recentChanges', limit],
    queryFn: async () => {
      const response = await fetch(`/api/changes?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching recent changes: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute (frequent updates expected)
  });
}

/**
 * Hook for fetching site statistics
 * @returns {Object} Query result object
 */
export function useSiteStats() {
  return useQuery({
    queryKey: ['siteStats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error(`Error fetching site stats: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}