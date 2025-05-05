// /components/changes/RecentChangesClientView.jsx
'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useRecentChanges } from '@/hooks/data/useWiki';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Format date utility
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Time ago utility
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years ago`;
  }
  if (interval === 1) {
    return `1 year ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  }
  if (interval === 1) {
    return `1 month ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  }
  if (interval === 1) {
    return `1 day ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  }
  if (interval === 1) {
    return `1 hour ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes ago`;
  }
  if (interval === 1) {
    return `1 minute ago`;
  }
  
  return `${Math.floor(seconds)} seconds ago`;
};

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
  // Use React Query with initial data from server
  const { 
    data: recentChanges = initialChanges, 
    isLoading, 
    error 
  } = useRecentChanges(100, {
    initialData: initialChanges
  });
  
  // Group changes by date
  const changesByDate = recentChanges.reduce((groups, change) => {
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
          {isLoading && initialChanges.length === 0 ? (
            <div className="text-center py-4">Loading recent changes...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
              Error loading recent changes: {error.message}
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
                <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200">
                  Load more changes
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