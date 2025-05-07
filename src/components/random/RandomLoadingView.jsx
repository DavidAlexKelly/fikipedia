// src/components/random/RandomLoadingView.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getRandomArticle } from '@/actions/articleActions';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RandomLoadingView() {
  const router = useRouter();
  
  // Use the getRandomArticle server action
  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['randomArticle'],
    queryFn: getRandomArticle,
    staleTime: 0, // Always refetch for true randomness
    cacheTime: 0, // Don't cache results
    retry: false, // Don't retry on failure
  });

  // Effect to handle redirection when article data is available
  useEffect(() => {
    if (article?.title) {
      // Redirect to the article
      router.push(`/wiki/${encodeURIComponent(article.title)}`);
    }
  }, [article, router]);

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Finding a random article...</h1>
          
          {isLoading ? (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">
                You'll be redirected to a random article momentarily.
              </p>
            </div>
          ) : error ? (
            <div className="text-red-600 mb-4">
              <p className="mb-2">Error: {error.message || "Could not find a random article"}</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              >
                Try Again
              </button>
            </div>
          ) : !article ? (
            <div className="text-gray-600 mb-4">
              <p className="mb-2">No articles found in the database.</p>
              <button 
                onClick={() => router.push('/create')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              >
                Create the First Article
              </button>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}