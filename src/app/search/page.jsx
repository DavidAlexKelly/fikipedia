// src/app/search/page.jsx
import SearchClientView from '@/components/search/SearchClientView';

export async function generateMetadata({ searchParams }) {
  const query = searchParams?.q || '';
  
  return {
    title: query ? `Search: ${query} - Fikipedia` : 'Search - Fikipedia',
    description: query 
      ? `Search results for "${query}" on Fikipedia.`
      : 'Search for articles on Fikipedia, the free fictional encyclopedia.',
  };
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams?.q || '';
  
  // The search is handled on the client-side to enable filtering and pagination
  return <SearchClientView initialQuery={query} />;
}