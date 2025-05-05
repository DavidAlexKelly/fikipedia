// src/components/layout/Footer.jsx
'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';

const Footer = memo(() => {
  // Memoized event handlers
  const handleReportIssue = useCallback(() => {
    window.open('/report-issue', '_blank');
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Current year is memoized implicitly by being outside component render
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and copyright */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-xl font-serif font-bold">Fikipedia</span>
              <span className="ml-2 text-xs text-gray-500">The Free Fictional Encyclopedia</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              © {currentYear} Fikipedia Contributors
            </div>
          </div>
          
          {/* Footer navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-medium mb-2 text-sm">About</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Fikipedia</Link></li>
                <li><Link href="/contributors" className="text-gray-600 hover:text-blue-600">Contributors</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact us</Link></li>
                <li><button onClick={handleReportIssue} className="text-gray-600 hover:text-blue-600">Report an issue</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-sm">Explore</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/categories" className="text-gray-600 hover:text-blue-600">Categories</Link></li>
                <li><Link href="/changes" className="text-gray-600 hover:text-blue-600">Recent changes</Link></li>
                <li><Link href="/random" className="text-gray-600 hover:text-blue-600">Random article</Link></li>
                <li><Link href="/featured" className="text-gray-600 hover:text-blue-600">Featured content</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-sm">Contribute</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/help" className="text-gray-600 hover:text-blue-600">Help</Link></li>
                <li><Link href="/community" className="text-gray-600 hover:text-blue-600">Community portal</Link></li>
                <li><Link href="/guidelines" className="text-gray-600 hover:text-blue-600">Content guidelines</Link></li>
                <li><Link href="/create" className="text-gray-600 hover:text-blue-600">Create an article</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xs text-gray-500 mb-3 sm:mb-0">
            All content is fictional and created by the community. No resemblance to real entities is intended.
          </div>
          
          <div className="flex space-x-4">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-blue-600">Terms</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-blue-600">Privacy</Link>
            <button 
              onClick={handleScrollToTop}
              className="text-xs text-gray-500 hover:text-blue-600 flex items-center"
              aria-label="Scroll to top"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
});

// Add display name for better debugging in React DevTools
Footer.displayName = 'Footer';

export default Footer;