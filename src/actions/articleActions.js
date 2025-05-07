// src/actions/articleActions.js
'use server'

import { articleRepository } from '@/repositories/articleRepository';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get an article by title
 */
export async function getArticleByTitle(title) {
  return articleRepository.findByTitle(title);
}

/**
 * Create a new article
 */
export async function createArticle(articleData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  
  const result = await articleRepository.create(articleData, session.user.id);
  
  // Revalidate cache
  revalidatePath(`/wiki/${encodeURIComponent(result.title)}`);
  revalidateTag('articles');
  revalidateTag('recent-changes');
  
  return result;
}

/**
 * Update an existing article
 */
export async function updateArticle(articleId, updates, summary) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  
  const result = await articleRepository.update(articleId, updates, session.user.id, summary);
  
  // Revalidate cache
  revalidatePath(`/wiki/${encodeURIComponent(result.title)}`);
  revalidateTag('articles');
  revalidateTag('recent-changes');
  
  return result;
}

/**
 * Get article revisions
 */
export async function getArticleRevisions(articleId, limit = 20) {
  return articleRepository.getRevisions(articleId, limit);
}

/**
 * Get recent changes
 */
export async function getRecentChanges(limit = 50) {
  return articleRepository.getRecentChanges(limit);
}

/**
 * Get a random article
 */
export async function getRandomArticle() {
  return articleRepository.getRandomArticle();
}