// src/actions/searchActions.js
'use server'

import { searchRepository } from '@/repositories/searchRepository';

export async function searchArticles(query, limit = 20) {
  if (!query || query.trim() === '') return [];
  return searchRepository.searchArticles(query, limit);
}