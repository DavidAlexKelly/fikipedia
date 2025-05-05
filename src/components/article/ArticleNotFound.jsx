// src/components/article/ArticleNotFound.jsx
import { memo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ArticleNotFound = memo(({ title }) => {
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <h1 className="text-2xl font-serif mb-3">{title}</h1>
            <p className="mb-4">This article doesn't exist yet. You can create it to share your fictional content!</p>
            <div className="flex flex-wrap gap-3">
              <Link 
                href={`/wiki/${encodeURIComponent(title)}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
              >
                Create this article
              </Link>
              <Link 
                href="/"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 inline-block"
              >
                Return to Main Page
              </Link>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-serif mb-4">Why create this article?</h2>
            <div className="prose">
              <p>
                Fikipedia is a collaborative platform for creating and sharing fictional content. 
                By creating this article, you can:
              </p>
              <ul>
                <li>Build your own fictional worlds, characters, or alternate histories</li>
                <li>Connect your creations to other fictional content</li>
                <li>Collaborate with others to expand fictional universes</li>
                <li>Document your creative writing in an encyclopedia format</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-serif mb-4">Article guidelines</h2>
            <div className="prose">
              <p>When creating your article, please follow these guidelines:</p>
              <ul>
                <li>Write in an encyclopedic style (third-person, factual tone)</li>
                <li>Clearly mark it as fictional content</li>
                <li>Use appropriate categories to help others find your content</li>
                <li>Link to other fictional articles to build connections</li>
                <li>Respect copyright and don't copy content from elsewhere</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-serif mb-4">Search results</h2>
            <p className="text-gray-600 italic mb-2">
              No exact matches found for "{title}". Here are some similar articles:
            </p>
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-gray-600 italic">No similar articles found.</p>
              <p className="mt-4 text-sm">
                You're creating something new! This will be the first article about "{title}" on Fikipedia.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
});

// Add display name for better debugging
ArticleNotFound.displayName = 'ArticleNotFound';

export default ArticleNotFound;