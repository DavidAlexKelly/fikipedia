// src/components/article/ArticleHistoryClientView.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { getArticleRevisions } from '@/actions/articleActions'; // Direct server action import
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/common/Loading';

// Format date utility function
const formatDate = (date) => {
  if (!date) return 'Unknown date';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Revision item component
const RevisionItem = memo(({ revision, isSelected, onSelect }) => {
  return (
    <li className="py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex flex-col sm:flex-row items-start">
        <div className="sm:w-40 flex-shrink-0 text-sm text-gray-500 mb-1 sm:mb-0">
          {formatDate(revision.timestamp)}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(revision.id)}
              className="mt-1 mr-2"
              aria-label={`Select revision ${revision.id}`}
            />
            
            <div>
              <Link 
                href={`/wiki/${encodeURIComponent(revision.articleTitle || 'Unknown')}/revision/${revision.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {formatDate(revision.timestamp)}
              </Link>
              
              <div className="text-sm">
                <span>by </span>
                <Link href={`/user/${revision.editor}`} className="text-blue-600 hover:underline">
                  {revision.editor}
                </Link>
                
                {revision.summary && (
                  <span className="ml-2 italic text-gray-600">
                    ({revision.summary})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
});

RevisionItem.displayName = 'RevisionItem';

// Main component
export default function ArticleHistoryClientView({ 
  title, 
  article = null, 
  initialRevisions = [] 
}) {
  const [selectedRevisions, setSelectedRevisions] = useState([]);
  const [revisions, setRevisions] = useState(initialRevisions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch additional revisions if needed
  const fetchMoreRevisions = useCallback(async () => {
    if (!article?.id) return;
    
    try {
      setIsLoading(true);
      // Call server action directly
      const additionalRevisions = await getArticleRevisions(article.id, 20, revisions.length);
      
      if (additionalRevisions.length > 0) {
        setRevisions(prev => [...prev, ...additionalRevisions]);
      }
    } catch (err) {
      console.error('Error fetching revisions:', err);
      setError(err.message || 'Failed to load more revisions');
    } finally {
      setIsLoading(false);
    }
  }, [article?.id, revisions.length]);
  
  const handleRevisionSelect = useCallback((revisionId) => {
    setSelectedRevisions(prev => {
      // If already selected, remove it
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId);
      }
      
      // If we have 2 revisions already, replace the oldest one
      if (prev.length >= 2) {
        return [prev[1], revisionId];
      }
      
      // Otherwise, add it
      return [...prev, revisionId];
    });
  }, []);
  
  const handleCompare = useCallback(() => {
    if (selectedRevisions.length !== 2) return;
    
    // Navigate to the diff view
    const oldRev = selectedRevisions[0];
    const newRev = selectedRevisions[1];
    window.location.href = `/wiki/${encodeURIComponent(title)}/diff/${oldRev}/${newRev}`;
  }, [selectedRevisions, title]);
  
  if (!article) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h2 className="text-xl font-bold mb-2">Article Not Found</h2>
              <p>The article "{title}" does not exist.</p>
              <div className="mt-4">
                <Link href={`/wiki/${encodeURIComponent(title)}/edit`} className="text-blue-600 hover:underline">
                  Create this article
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif mb-3">
            Revision history for: <span className="font-bold">{title}</span>
          </h1>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">
              <Link href={`/wiki/${encodeURIComponent(title)}`} className="text-blue-600 hover:underline">
                ← Back to article
              </Link>
            </div>
            
            <button
              onClick={handleCompare}
              disabled={selectedRevisions.length !== 2}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-sm"
            >
              Compare selected revisions
            </button>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-300 py-3 px-4">
              <h2 className="font-medium">Revision History</h2>
            </div>
            
            {isLoading && revisions.length === 0 ? (
              <div className="p-4">
                <Loading message="Loading revisions..." />
              </div>
            ) : error && revisions.length === 0 ? (
              <div className="p-4 bg-red-50 text-red-700">
                Error loading revisions: {error}
              </div>
            ) : revisions.length > 0 ? (
              <>
                <ul className="divide-y divide-gray-200">
                  {revisions.map(revision => (
                    <RevisionItem
                      key={revision.id}
                      revision={revision}
                      isSelected={selectedRevisions.includes(revision.id)}
                      onSelect={handleRevisionSelect}
                    />
                  ))}
                </ul>
                
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading more revisions...</p>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <button
                      onClick={fetchMoreRevisions}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Load more revisions
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No revisions found for this article.
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              This page shows the revision history of the article. 
              Select two revisions to compare them and see what was changed.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}