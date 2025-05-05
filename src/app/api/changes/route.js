// /app/api/changes/route.js
import { NextResponse } from 'next/server';
import { getRecentChanges } from '@/services/server/wikiService';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const changes = await getRecentChanges(limit);
    
    return NextResponse.json(changes);
  } catch (error) {
    console.error('Error fetching recent changes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch recent changes' }, { status: 500 });
  }
}