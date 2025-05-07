// src/hooks/data/useWiki.js
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentChanges, getSiteStats, getFeaturedContent } from '@/actions/wikiActions';

/**
 * Hook for fetching recent changes
 */
export function useRecentChanges(limit = 50, options = {}) {
  return useQuery({
    queryKey: ['recentChanges', limit],
    queryFn: () => getRecentChanges(limit),
    staleTime: 60 * 1000, // 1 minute
    ...options
  });
}

/**
 * Hook for fetching site statistics
 */
export function useSiteStats(options = {}) {
  return useQuery({
    queryKey: ['siteStats'],
    queryFn: getSiteStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
}

/**
 * Hook for fetching featured content
 */
export function useFeaturedContent(limit = 5, options = {}) {
  return useQuery({
    queryKey: ['featuredContent', limit],
    queryFn: () => getFeaturedContent(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options
  });
}