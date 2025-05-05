// /app/profile/page.jsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserProfile, getUserContributions } from '@/services/server/userService';
import ProfileClientView from '@/components/profile/ProfileClientView';

export async function generateMetadata() {
  return {
    title: 'Your Profile - Fikipedia',
    description: 'View and manage your Fikipedia profile, contributions, and settings.',
  };
}

export default async function ProfilePage({ params, searchParams }) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session) {
    return redirect('/login?callbackUrl=/profile');
  }
  
  // Fetch user data server-side
  const userId = session.user.id;
  let userProfile = await getUserProfile(userId);
  
  // If profile doesn't exist, use basic data from session
  if (!userProfile) {
    userProfile = {
      id: userId,
      displayName: session.user.name,
      email: session.user.email,
      photoURL: session.user.image,
      createdAt: new Date().toISOString()
    };
    
    // Optionally, you could create the user profile here
    // await createUserProfile(userProfile);
  }
  
  // Use empty array for contributions if fetch fails
  let contributions = [];
  try {
    contributions = await getUserContributions(userId, 20);
  } catch (error) {
    console.error("Error fetching contributions:", error);
  }
  
  // Pass data to client component
  return <ProfileClientView 
    session={session} 
    initialProfile={userProfile} 
    initialContributions={contributions} 
  />;
}