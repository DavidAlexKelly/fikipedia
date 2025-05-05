// src/components/layout/Header.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';

const Header = memo(() => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Memoized handlers
  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);
  
  const handleSignIn = useCallback(() => {
    signIn();
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
    setShowUserMenu(false);
  }, []);
  
  // Extract article title from path for wiki navigation
  const articleTitle = useCallback(() => {
    if (pathname.startsWith('/wiki/')) {
      return decodeURIComponent(pathname.substring(6));
    }
    return '';
  }, [pathname]);
  
  // Determine if we're on an article page or subpage
  const isArticlePage = pathname.startsWith('/wiki/');
  const isArticleEdit = pathname.includes('/edit');
  const isArticleTalk = pathname.includes('/talk');
  const isArticleHistory = pathname.includes('/history');
  
  // Get article title for navigation
  const currentArticleTitle = articleTitle();
  
  // User menu content
  const renderUserMenu = () => {
    if (status === 'authenticated' && session) {
      return (
        <div>
          <button 
            className="flex items-center text-sm"
            onClick={toggleUserMenu}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            {session.user.image ? (
              <img
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-8 h-8 rounded-full mr-2"
                width={32}
                height={32}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
            <span className="hidden sm:inline-block">
              {session.user.name || session.user.email}
            </span>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
              <Link 
                href="/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                My Profile
              </Link>
              <Link 
                href="/changes"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                Recent Changes
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <button 
        className="text-blue-600 hover:underline text-sm"
        onClick={handleSignIn}
      >
        Log in / Sign up
      </button>
    );
  };

  // Mobile menu content
  const renderMobileMenu = () => {
    if (!showMobileMenu) return null;

    return (
      <div className="md:hidden px-4 py-3 border-b border-gray-200">
        <div className="mb-3">
          <SearchAutocomplete />
        </div>
        
        <div className="flex flex-col">
          <Link 
            href="/"
            className="py-2 border-b border-gray-100"
            onClick={toggleMobileMenu}
          >
            Main Page
          </Link>
          <Link 
            href="/changes"
            className="py-2 border-b border-gray-100"
            onClick={toggleMobileMenu}
          >
            Recent Changes
          </Link>
          <Link 
            href="/random"
            className="py-2 border-b border-gray-100"
            onClick={toggleMobileMenu}
          >
            Random Article
          </Link>
          
          {status === 'authenticated' && session ? (
            <>
              <Link 
                href="/profile"
                className="py-2 border-b border-gray-100"
                onClick={toggleMobileMenu}
              >
                My Profile
              </Link>
              <button 
                onClick={() => {
                  handleSignOut();
                  toggleMobileMenu();
                }}
                className="py-2 text-left text-red-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                handleSignIn();
                toggleMobileMenu();
              }}
              className="py-2 text-left text-blue-600"
            >
              Log in / Sign up
            </button>
          )}
        </div>
      </div>
    );
  };

  // Article navigation
  const renderArticleNavigation = () => {
    if (!isArticlePage) return null;

    return (
      <div className="bg-gray-50 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto whitespace-nowrap hide-scrollbar">
            <Link 
              href={`/wiki/${currentArticleTitle}`} 
              className={`py-2 px-4 ${!isArticleEdit && !isArticleTalk && !isArticleHistory ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:text-blue-600'}`}
            >
              Article
            </Link>
            <Link 
              href={`/wiki/${currentArticleTitle}/talk`} 
              className={`py-2 px-4 ${isArticleTalk ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:text-blue-600'}`}
            >
              Talk
            </Link>
            <Link 
              href={`/wiki/${currentArticleTitle}/edit`} 
              className={`py-2 px-4 ${isArticleEdit ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:text-blue-600'}`}
            >
              Edit
            </Link>
            <Link 
              href={`/wiki/${currentArticleTitle}/history`} 
              className={`py-2 px-4 ${isArticleHistory ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:text-blue-600'}`}
            >
              History
            </Link>
            <Link href="/changes" className="py-2 px-4 hover:text-blue-600">
              Recent Changes
            </Link>
            <Link href="/random" className="py-2 px-4 hover:text-blue-600">
              Random
            </Link>
          </nav>
        </div>
      </div>
    );
  };
  
  return (
    <header className="bg-white shadow">
      {/* Top Bar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold">Fikipedia</span>
            <span className="ml-2 text-xs text-gray-500 hidden sm:inline-block">The Free Fictional Encyclopedia</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search - Now using Autocomplete component */}
            <SearchAutocomplete />
            
            {/* User Menu */}
            <div className="relative">
              {renderUserMenu()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {renderMobileMenu()}
      
      {/* Article Navigation Bar */}
      {renderArticleNavigation()}
    </header>
  );
});

// Add display name for better debugging
Header.displayName = 'Header';

export default Header;