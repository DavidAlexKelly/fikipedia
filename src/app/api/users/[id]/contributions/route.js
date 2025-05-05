// /app/api/users/[id]/contributions/route.js
import { NextResponse } from 'next/server';
import { getUserContributions } from '@/services/server/userService';

export async function GET(request, { params }) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const contributions = await getUserContributions(userId, limit);
    
    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user contributions' }, { status: 500 });
  }
}