// src/app/api/articles/[title]/route.js
import { NextResponse } from 'next/server';
import { articleRepository } from '@/repositories/articleRepository';

export async function GET(request, { params }) {
  try {
    const title = params.title;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const article = await articleRepository.findByTitle(title);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}