// src/components/profile/ProfileClientView.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useUserContributions } from '@/hooks/data/useUser';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Format date utility function
const formatDate = (date) => {
  if (!date) return 'Unknown date';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// User avatar component
const UserAvatar = memo(({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };
  
  const className = `${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`;
  
  if (user?.image) {
    return (
      <div className={className}>
        <img 
          src={user.image} 
          alt={user.name || 'User'} 
          className="w-full h-full object-cover" 
          width={size === 'lg' ? 96 : size === 'md' ? 64 : 32}
          height={size === 'lg' ? 96 : size === 'md' ? 64 : 32}
        />
      </div>
    );
  }
  
  return (
    <div className={`${className} flex items-center justify-center bg-blue-100 text-blue-500`}>
      <span className={size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-sm'}>
        {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
      </span>
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Tab button component
const TabButton = memo(({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium ${
      isActive
        ? 'text-blue-600 border-b-2 border-blue-500'
        : 'text-gray-600 hover:text-blue-600'
    }`}
  >
    {label}
  </button>
));

TabButton.displayName = 'TabButton';

// Contribution item component
const ContributionItem = memo(({ contribution }) => (
  <li className="py-3">
    <div className="flex flex-col sm:flex-row sm:items-start">
      <div className="sm:w-40 flex-shrink-0 text-sm text-gray-500 mb-1 sm:mb-0">
        {formatDate(contribution.timestamp)}
      </div>
      <div>
        <Link 
          href={`/wiki/${encodeURIComponent(contribution.articleTitle || 'Unknown')}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {contribution.articleTitle || 'Unknown Article'}
        </Link>
        <div className="text-sm text-gray-700">
          <span className="italic">{contribution.summary || 'No edit summary'}</span>
        </div>
        <div className="mt-1 flex gap-2 text-xs text-gray-500">
          <Link 
            href={`/wiki/${encodeURIComponent(contribution.articleTitle || 'Unknown')}/history`}
            className="text-blue-600 hover:underline"
          >
            history
          </Link>
          <Link 
            href={`/wiki/${encodeURIComponent(contribution.articleTitle || 'Unknown')}/revision/${contribution.id}`}
            className="text-blue-600 hover:underline"
          >
            diff
          </Link>
        </div>
      </div>
    </div>
  </li>
));

ContributionItem.displayName = 'ContributionItem';

// Contributions tab content
const ContributionsTab = memo(({ contributions = [], isLoading, error }) => (
  <div>
    <h2 className="text-xl font-serif mb-4">Your Contributions</h2>
    
    {isLoading ? (
      <div className="text-center py-4">Loading contributions...</div>
    ) : error ? (
      <div className="bg-red-50 border border-red-200 p-4 rounded text-red-600">
        Error loading contributions: {error.message || "Unknown error"}
      </div>
    ) : contributions?.length > 0 ? (
      <ul className="divide-y divide-gray-200">
        {contributions.map((contribution) => (
          <ContributionItem key={contribution.id} contribution={contribution} />
        ))}
      </ul>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-4">You haven't made any contributions yet.</p>
        <Link 
          href="/create"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
        >
          Create Your First Article
        </Link>
      </div>
    )}
  </div>
));

ContributionsTab.displayName = 'ContributionsTab';

// Settings tab content
const SettingsTab = memo(({ session }) => (
  <div>
    <h2 className="text-xl font-serif mb-4">Account Settings</h2>
    
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Profile Information</h3>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded"
              value={session?.user?.name || ''}
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              Name is provided by your sign-in provider.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              className="w-full p-2 border border-gray-300 rounded"
              value={session?.user?.email || ''}
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              Email is provided by your sign-in provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
));

SettingsTab.displayName = 'SettingsTab';

// Main ProfileView component
export default function ProfileClientView({ 
  session, 
  initialProfile = null, 
  initialContributions = [] 
}) {
  const [activeTab, setActiveTab] = useState('contributions');
  
  // Use the userContributions hook (now using server actions)
  const {
    data: contributions = initialContributions, 
    isLoading: contributionsLoading,
    error: contributionsError
  } = useUserContributions(session.user.id, {
    initialData: initialContributions
  });
  
  // Tab change handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-300">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <UserAvatar user={session.user} size="lg" />
                
                <div className="text-center sm:text-left sm:ml-6 mt-4 sm:mt-0">
                  <h1 className="text-2xl font-serif font-bold">{session.user.name || 'User'}</h1>
                  <p className="text-gray-600">{session.user.email}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Member since {formatDate(initialProfile?.createdAt || new Date())}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-300">
              <nav className="flex">
                <TabButton 
                  label="Contributions"
                  isActive={activeTab === 'contributions'}
                  onClick={() => handleTabChange('contributions')}
                />
                <TabButton 
                  label="Settings"
                  isActive={activeTab === 'settings'}
                  onClick={() => handleTabChange('settings')}
                />
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'contributions' ? (
                <ContributionsTab 
                  contributions={contributions}
                  isLoading={contributionsLoading}
                  error={contributionsError}
                />
              ) : (
                <SettingsTab session={session} />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}