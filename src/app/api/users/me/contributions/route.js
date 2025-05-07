// src/app/api/users/me/contributions/route.js
import { NextResponse } from 'next/server';
import { userRepository } from '@/repositories/userRepository';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const contributions = await userRepository.getContributions(userId, limit);
    
    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user contributions' }, { status: 500 });
  }
}