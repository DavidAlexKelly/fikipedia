// src/actions/authActions.js
'use server'

import { authRepository } from '@/repositories/authRepository';

export async function getUserProfile(uid) {
  return authRepository.getUserProfile(uid);
}