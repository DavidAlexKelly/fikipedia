// /app/api/categories/[category]/articles/route.js
import { NextResponse } from 'next/server';
import { getArticlesByCategory } from '@/services/server/categoryService';

export async function GET(request, { params }) {
  try {
    const category = params.category ? decodeURIComponent(params.category) : '';
    
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const articles = await getArticlesByCategory(category, limit);
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch articles' }, { status: 500 });
  }
}