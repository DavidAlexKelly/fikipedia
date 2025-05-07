// src/hooks/data/useWiki.js
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentChanges } from '@/actions/articleActions';
import { getSiteStats } from '@/actions/wikiActions';

/**
 * Hook for fetching recent changes
 */
export function useRecentChanges(limit = 50) {
  return useQuery({
    queryKey: ['recentChanges', limit],
    queryFn: () => getRecentChanges(limit),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for fetching site statistics
 */
export function useSiteStats() {
  return useQuery({
    queryKey: ['siteStats'],
    queryFn: getSiteStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}