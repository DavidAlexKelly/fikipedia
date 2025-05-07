// src/components/article/ArticleClientView.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToggleWatchArticle } from '@/hooks/data/useUser';
import { incrementViewCount } from '@/actions/articleActions'; // Direct server action import
import TableOfContents from '@/components/article/TableOfContents';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatDate } from '@/lib/utils/dateUtils';

export default function ArticleClientView({ article, contentHtml, headings }) {
  const { data: session } = useSession();
  const [isWatching, setIsWatching] = useState(
    article.watchedBy?.includes(session?.user?.id) || false
  );
  
  // Use the toggleWatchArticle hook from our new architecture
  const { mutate: toggleWatch, isPending: isWatchTogglePending } = useToggleWatchArticle();
  
  // Track view on component mount
  useEffect(() => {
    if (article?.id) {
      // Call server action directly to increment view count
      incrementViewCount(article.id).catch(err => {
        // Non-critical operation, just log error
        console.error('Failed to increment view count:', err);
      });
    }
  }, [article?.id]);
  
  const handleToggleWatch = () => {
    if (!session) {
      // Redirect to login if not signed in
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    toggleWatch(
      { articleId: article.id },
      {
        onSuccess: (data) => {
          setIsWatching(data.isWatching);
        }
      }
    );
  };
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Article Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-serif mb-3">{article.title}</h1>
            
            {/* Article tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <div className="mr-4 border-b-2 border-blue-500 pb-2 text-blue-600 font-medium">
                Article
              </div>
              <Link href={`/wiki/${encodeURIComponent(article.title)}/talk`} className="mr-4 text-gray-500 hover:text-gray-900 pb-2">
                Talk
              </Link>
              <Link href={`/wiki/${encodeURIComponent(article.title)}/edit`} className="mr-4 text-gray-500 hover:text-gray-900 pb-2">
                Edit
              </Link>
              <Link href={`/wiki/${encodeURIComponent(article.title)}/history`} className="mr-4 text-gray-500 hover:text-gray-900 pb-2">
                History
              </Link>
            </div>
          </div>
          
          {/* Article Content with Sidebar Layout */}
          <div className="flex flex-col md:flex-row">
            {/* Table of Contents (for larger screens) */}
            <div className="hidden md:block w-64 flex-shrink-0 mr-6">
              {headings.length > 1 && (
                <TableOfContents headings={headings} />
              )}
              
              {/* Other sidebar elements */}
              <div className="border border-gray-300 rounded p-3 mb-6">
                <div className="font-medium text-sm mb-2">Tools</div>
                <ul className="text-sm">
                  <li className="my-1">
                    <button
                      onClick={handleToggleWatch}
                      disabled={isWatchTogglePending}
                      className="text-blue-600 hover:underline"
                    >
                      {isWatchTogglePending ? 'Updating...' : isWatching ? 'Unwatch' : 'Watch'} this article
                    </button>
                  </li>
                  <li className="my-1">
                    <Link href={`/wiki/Special:WhatLinksHere/${encodeURIComponent(article.title)}`} className="text-blue-600 hover:underline">
                      What links here
                    </Link>
                  </li>
                  <li className="my-1">
                    <Link href={`/wiki/Special:RecentChangesLinked/${encodeURIComponent(article.title)}`} className="text-blue-600 hover:underline">
                      Related changes
                    </Link>
                  </li>
                  <li className="my-1">
                    <Link href="/wiki/Special:SpecialPages" className="text-blue-600 hover:underline">
                      Special pages
                    </Link>
                  </li>
                  <li className="my-1">
                    <Link href={`/wiki/${encodeURIComponent(article.title)}?printable=yes`} className="text-blue-600 hover:underline">
                      Printable version
                    </Link>
                  </li>
                  <li className="my-1">
                    <Link href={`/wiki/${encodeURIComponent(article.title)}?oldid=${article.id}`} className="text-blue-600 hover:underline">
                      Permanent link
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-grow">
              {/* Mobile Table of Contents */}
              <div className="md:hidden mb-4">
                {headings.length > 1 && (
                  <TableOfContents headings={headings} />
                )}
              </div>
              
              {/* Article Content */}
              <div 
                className="prose max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              
              {/* Categories */}
              {article.categories && article.categories.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-300">
                  <div className="text-sm">
                    <strong>Categories:</strong> {article.categories.map((category, index) => (
                      <span key={index} className="inline-block mr-2">
                        <Link href={`/category/${encodeURIComponent(category)}`} className="text-blue-600 hover:underline">
                          {category}
                        </Link>
                        {index < article.categories.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Article Footer */}
              <div className="mt-8 text-xs text-gray-600">
                <div>
                  This page was last edited on {formatDate(article.lastModified, 'long')} at {formatDate(article.lastModified, 'time')}, by {' '}
                  <Link href={`/user/${article.lastEditor}`} className="text-blue-600 hover:underline">
                    {article.lastEditor}
                  </Link>.
                </div>
                <div className="mt-2">
                  <Link href="/guidelines" className="text-blue-600 hover:underline">Content guidelines</Link> apply to all content on Fikipedia.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}