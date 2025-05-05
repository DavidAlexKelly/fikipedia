// /app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserProfile } from '@/services/server/userService';

export async function GET(request, { params }) {
  try {
    const userId = await params.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Filter sensitive information for non-self profiles
    const publicProfile = {
      id: userProfile.id,
      displayName: userProfile.displayName,
      photoURL: userProfile.photoURL,
      createdAt: userProfile.createdAt,
      // Add other public fields as needed
    };
    
    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user profile' }, { status: 500 });
  }
}