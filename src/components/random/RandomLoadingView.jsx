// src/components/random/RandomLoadingView.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomArticle } from '@/actions/articleActions'; // Direct server action import
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RandomLoadingView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to fetch random article and redirect
  useEffect(() => {
    const fetchRandomArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call server action directly
        const article = await getRandomArticle();
        
        if (article?.title) {
          // Redirect to the article
          router.push(`/wiki/${encodeURIComponent(article.title)}`);
        } else {
          setError('No articles found in the database');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching random article:', err);
        setError(err.message || 'Failed to fetch random article');
        setIsLoading(false);
      }
    };

    fetchRandomArticle();
  }, [router]);

  // Handle retry
  const handleRetry = async () => {
    await fetchRandomArticle();
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
              <p className="mb-2">Error: {error}</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}