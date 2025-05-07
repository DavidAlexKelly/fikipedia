// src/app/random/page.jsx
import { getRandomArticle } from '@/actions/articleActions'; // Updated import
import { redirect } from 'next/navigation';
import RandomLoadingView from '@/components/random/RandomLoadingView';

export async function generateMetadata() {
  return {
    title: 'Random Article - Fikipedia',
    description: 'View a random article from Fikipedia, the free fictional encyclopedia.',
  };
}

export default async function RandomPage() {
  // Try to get a random article using server action
  const article = await getRandomArticle();
  
  // If we found an article, redirect to it
  if (article?.title) {
    return redirect(`/wiki/${encodeURIComponent(article.title)}`);
  }
  
  // If no article was found, show loading view with client-side retry
  return <RandomLoadingView />;
}