// /app/api/articles/[id]/revisions/route.js
import { NextResponse } from 'next/server';
import { getArticleRevisions } from '@/services/server/articleService';

export async function GET(request, { params }) {
  try {
    const articleId = params.id;
    
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const revisions = await getArticleRevisions(articleId, limit);
    
    return NextResponse.json(revisions);
  } catch (error) {
    console.error('Error fetching article revisions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch article revisions' }, { status: 500 });
  }
}