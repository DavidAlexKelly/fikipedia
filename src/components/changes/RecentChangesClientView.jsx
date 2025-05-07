// src/components/changes/RecentChangesClientView.jsx
'use client';

import { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecentChanges } from '@/actions/wikiActions'; // Direct server action import
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/common/Loading';
import { formatDate, timeAgo } from '@/lib/utils/dateUtils';

// Memoized change item component
const ChangeItem = memo(({ change }) => {
  const dateObj = typeof change.lastModified === 'string' 
    ? new Date(change.lastModified) 
    : change.lastModified;
    
  const createdAtObj = typeof change.createdAt === 'string'
    ? new Date(change.createdAt)
    : change.createdAt;
    
  const isNewPage = createdAtObj.getTime() === dateObj.getTime();
  
  return (
    <li className="py-3 flex flex-col sm:flex-row">
      <div className="text-gray-500 text-sm w-full sm:w-32 mb-1 sm:mb-0">
        {formatDate(dateObj)}
      </div>
      <div className="flex-grow">
        <div className="flex items-start">
          <span className="inline-block w-3 h-3 mt-1 mr-2 flex-shrink-0">
            {isNewPage && (
              <span className="inline-block w-3 h-3 bg-green-200" title="New page"></span>
            )}
          </span>
          <div>
            <Link href={`/wiki/${encodeURIComponent(change.title)}`} className="text-blue-600 hover:underline font-medium">
              {change.title}
            </Link>
            <div className="text-sm text-gray-600">
              edited by <Link href={`/user/${change.lastEditor}`} className="text-blue-600 hover:underline">{change.lastEditor}</Link>
              {' · '}
              <Link href={`/wiki/${encodeURIComponent(change.title)}/history`} className="text-blue-600 hover:underline">history</Link>
              {' · '}
              <span title={formatDate(dateObj)}>{timeAgo(dateObj)}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
});

ChangeItem.displayName = 'ChangeItem';

// Memoized day group component
const DayGroup = memo(({ dateString, changes }) => (
  <div className="mb-8">
    <h2 className="text-xl font-serif mb-3 pb-1 border-b border-gray-300">
      {new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </h2>
    
    <ul className="divide-y divide-gray-100">
      {changes.map(change => (
        <ChangeItem 
          key={change.id} 
          change={change}
        />
      ))}
    </ul>
  </div>
));

DayGroup.displayName = 'DayGroup';

// Main component
export default function RecentChangesClientView({ initialChanges = [] }) {
  const [changes, setChanges] = useState(initialChanges);
  const [isLoading, setIsLoading] = useState(!initialChanges.length);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Fetch initial changes if not provided
  useEffect(() => {
    const fetchInitialChanges = async () => {
      if (initialChanges.length > 0) return;
      
      try {
        setIsLoading(true);
        const recentChanges = await getRecentChanges(50);
        setChanges(recentChanges || []);
      } catch (err) {
        console.error('Error fetching recent changes:', err);
        setError(err.message || 'Failed to load recent changes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialChanges();
  }, [initialChanges.length]);
  
  // Group changes by date
  const changesByDate = changes.reduce((groups, change) => {
    // Ensure lastModified is a Date object
    const dateObj = typeof change.lastModified === 'string' 
      ? new Date(change.lastModified) 
      : change.lastModified;
    
    const date = dateObj.toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(change);
    return groups;
  }, {});
  
  // Get unique date strings and sort them in reverse chronological order
  const dates = Object.keys(changesByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      
      // Load next page of changes using the last change's date as a cursor
      const lastChangeDate = changes.length > 0 
        ? changes[changes.length - 1].lastModified 
        : null;
      
      const nextPageChanges = await getRecentChanges(50, lastChangeDate);
      
      if (nextPageChanges.length === 0) {
        setHasMore(false);
      } else {
        setChanges(prev => [...prev, ...nextPageChanges]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error loading more changes:', err);
      setError(err.message || 'Failed to load more changes');
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif mb-6">Recent Changes</h1>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm">
              This page lists the most recent changes to articles on Fikipedia. 
              <Link href="/help/recent-changes" className="text-blue-600 hover:underline ml-1">
                Learn more about recent changes
              </Link>
            </p>
          </div>
          
          {/* Recent Changes List */}
          {isLoading ? (
            <Loading message="Loading recent changes..." />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
              Error loading recent changes: {error}
            </div>
          ) : dates.length > 0 ? (
            <div>
              {dates.map(dateString => (
                <DayGroup 
                  key={dateString} 
                  dateString={dateString} 
                  changes={changesByDate[dateString]} 
                />
              ))}
              
              <div className="mt-6 flex justify-center">
                <button 
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50"
                  onClick={handleLoadMore}
                  disabled={!hasMore || isLoadingMore}
                >
                  {isLoadingMore ? 'Loading more...' : hasMore ? 'Load more changes' : 'No more changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent changes found.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}