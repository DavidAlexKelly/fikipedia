// /app/page.jsx
import { getSiteStats } from '@/services/server/wikiService';
import HomeClientView from '@/components/home/HomeClientView';

export async function generateMetadata() {
  return {
    title: 'Fikipedia - The Free Fictional Encyclopedia',
    description: 'Create and explore fictional wikis, alternate histories, and imaginary worlds.',
  };
}

export default async function HomePage() {
  // Fetch site stats server-side
  const stats = await getSiteStats();
  
  // Pass to client component
  return <HomeClientView initialStats={stats} />;
}