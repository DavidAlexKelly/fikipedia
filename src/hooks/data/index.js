// src/hooks/data/index.js
// Export all data hooks from a central location

// Article hooks
export {
  useArticle,
  useArticleRevisions,
  useCreateArticle,
  useUpdateArticle
} from './useArticle';

// Category hooks
export {
  useArticlesByCategory,
  useAllCategories
} from './useCategory';

// Search hooks
export {
  useSearch,
  useSearchArticles
} from './useSearch';

// User hooks
export {
  useUserProfile,
  useUserContributions,
  useUpdateUserProfile,
  useToggleWatchArticle,
  useWatchedArticles
} from './useUser';

// Wiki hooks
export {
  useRecentChanges,
  useSiteStats
} from './useWiki';

// Random hooks
export {
  useRandomArticle
} from './useRandom';