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
  const userProfile = await getUserProfile(userId);
  const contributions = await getUserContributions(userId, 20);
  
  // Pass data to client component
  return <ProfileClientView 
    session={session} 
    initialProfile={userProfile} 
    initialContributions={contributions} 
  />;
}