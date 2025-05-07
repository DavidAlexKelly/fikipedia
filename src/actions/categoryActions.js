// src/actions/categoryActions.js
'use server'

import { wikiRepository } from '@/repositories/wikiRepository';

export async function getArticlesByCategory(category) {
  return wikiRepository.getArticlesByCategory(category);
}

export async function getCategoryInfo(category) {
  return wikiRepository.getCategoryInfo(category);
}

export async function getAllCategories() {
  return wikiRepository.getAllCategories();
}