// /app/api/stats/route.js
import { NextResponse } from 'next/server';
import { getSiteStats } from '@/services/server/wikiService';

export async function GET() {
  try {
    const stats = await getSiteStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching site statistics:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch site statistics' }, { status: 500 });
  }
}