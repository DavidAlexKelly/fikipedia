// /app/api/articles/random/route.js
import { NextResponse } from 'next/server';
import { getRandomArticle } from '@/services/server/articleService';

export async function GET() {
  try {
    const article = await getRandomArticle();
    
    if (!article) {
      return NextResponse.json({ error: 'No articles found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching random article:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch random article' }, { status: 500 });
  }
}