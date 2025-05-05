// /app/api/articles/[title]/route.js
import { NextResponse } from 'next/server';
import { getArticleByTitle } from '@/services/server/articleService';

export async function GET(request, { params }) {
  try {
    const title = params.title;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const article = await getArticleByTitle(title);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}