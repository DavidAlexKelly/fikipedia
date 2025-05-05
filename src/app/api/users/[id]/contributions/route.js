// /api/users/[id]/contributions/route.js
import { NextResponse } from 'next/server';
import { getUserContributions } from '@/services/server/userService';

export async function GET(request, { params }) {
  try {
    // This is the correct way to await params in Next.js 13+
    const userId = params?.id ? params.id : null;
    
    // Get query parameters properly
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    // Parse to number with fallback
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    // Validate to ensure it's a valid number
    const validLimit = isNaN(limit) ? 50 : limit;
    
    const contributions = await getUserContributions(userId, validLimit);
    
    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user contributions' }, { status: 500 });
  }
}