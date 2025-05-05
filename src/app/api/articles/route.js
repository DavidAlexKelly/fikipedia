// /app/api/articles/route.js
import { NextResponse } from 'next/server';
import { createArticle } from '@/services/server/articleService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const articleData = await request.json();
    
    if (!articleData.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const result = await createArticle(articleData, userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: error.message || 'Failed to create article' }, { status: 500 });
  }
}