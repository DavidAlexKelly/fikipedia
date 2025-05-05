// src/services/index.js
// Main exports from all service modules

// Article services
export {
    getArticleByTitle,
    getArticleByTitleClient,
    getArticleByTitleServer,
    createArticle,
    updateArticle,
    getArticleRevisions,
    getRecentChanges,
    getArticlesByCategory,
    getRandomArticle
  } from './api/articles';
  
  // User services
  export {
    getUserProfile,
    getUserContributions,
    updateUserProfile,
    toggleWatchArticle,
    getWatchedArticles,
    createUserProfile
  } from './api/users';
  
  // Authentication services
  export {
    signInWithGoogle,
    signInWithApple,
    signOut
  } from './api/auth';
  
  // Search services
  export {
    searchArticles,
    searchByAlgolia
  } from './api/search';
  
  // Wiki-wide services
  export {
    getSiteStats,
    getAllCategories
  } from './api/wiki';
  
  // Helper exports
  export {
    serializeArticle,
    serializeRevision,
    serializeUser,
    serializeDocument
  } from './helpers/serializers';