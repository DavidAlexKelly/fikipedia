// src/app/changes/page.jsx
import { getRecentChanges } from '@/actions/articleActions'; // Updated import
import RecentChangesClientView from '@/components/changes/RecentChangesClientView';

export async function generateMetadata() {
  return {
    title: 'Recent Changes - Fikipedia',
    description: 'View the most recent edits and new articles on Fikipedia.',
  };
}

export default async function RecentChangesPage() {
  // Fetch recent changes using server action
  const changes = await getRecentChanges(50);
  
  // Pass data to client component
  return <RecentChangesClientView initialChanges={changes} />;
}