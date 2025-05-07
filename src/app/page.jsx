// src/app/page.jsx
import { getSiteStats } from '@/actions/wikiActions'; // Updated import
import HomeClientView from '@/components/home/HomeClientView';

export async function generateMetadata() {
  return {
    title: 'Fikipedia - The Free Fictional Encyclopedia',
    description: 'Create and explore fictional wikis, alternate histories, and imaginary worlds.',
  };
}

export default async function HomePage() {
  // Fetch site stats using server action
  const stats = await getSiteStats();
  
  // Pass to client component
  return <HomeClientView initialStats={stats} />;
}