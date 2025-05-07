// src/actions/categoryActions.js
'use server'

import { categoryRepository } from '@/repositories/categoryRepository';
import { ValidationError, NotFoundError } from '@/lib/errors/appErrors';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
export async function getAllCategories() {
  return categoryRepository.getAllCategories();
}

/**
 * Get articles by category
 * @param {string} category - Category name
 * @param {number} limit - Maximum number of articles to return
 * @returns {Promise<Array>} Array of articles in the category
 */
export async function getArticlesByCategory(category, limit = 50) {
  if (!category) {
    throw new ValidationError("Category name is required");
  }
  
  return categoryRepository.getArticlesByCategory(category, limit);
}

/**
 * Get category information
 * @param {string} category - Category name
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getCategoryInfo(category) {
  if (!category) {
    return null;
  }
  
  return categoryRepository.getCategoryInfo(category);
}

/**
 * Create a new category
 * @param {string} name - Category name
 * @returns {Promise<Object>} Created category
 */
export async function createCategory(name) {
  if (!name) {
    throw new ValidationError("Category name is required");
  }
  
  const result = await categoryRepository.createCategory(name);
  
  // Revalidate cache
  revalidateTag('categories');
  
  return result;
}

/**
 * Increment category article count
 * @param {string} category - Category name
 */
export async function incrementCategoryArticleCount(category) {
  if (!category) return;
  
  await categoryRepository.incrementArticleCount(category);
  revalidateTag('categories');
}

/**
 * Decrement category article count
 * @param {string} category - Category name
 */
export async function decrementCategoryArticleCount(category) {
  if (!category) return;
  
  await categoryRepository.decrementArticleCount(category);
  revalidateTag('categories');
}