// src/components/search/SearchAutocomplete.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import algoliasearch from 'algoliasearch/lite';

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Initialize Algolia client directly
  const algoliaClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  );
  const algoliaIndex = algoliaClient.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME);
  
  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      performSearch(value);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };
  
  // Perform search with debounce
  const performSearch = async (searchQuery) => {
    setLoading(true);
    
    try {
      const { hits } = await algoliaIndex.search(searchQuery, {
        hitsPerPage: 5,
        attributesToRetrieve: ['title', 'content'],
        attributesToHighlight: ['title'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });
      
      setResults(hits);
      setIsOpen(hits.length > 0);
    } catch (error) {
      console.error('Autocomplete search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };
  
  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) && 
        resultsRef.current && 
        !resultsRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search Fikipedia" 
            className="w-full py-1 px-3 border border-gray-300 rounded text-sm"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            aria-label="Search"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </form>
      
      {/* Autocomplete results dropdown */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg"
        >
          {loading ? (
            <div className="p-2 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            <ul>
              {results.map((hit) => (
                <li key={hit.objectID} className="border-b border-gray-100 last:border-b-0">
                  <Link 
                    href={`/wiki/${encodeURIComponent(hit.title)}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <div dangerouslySetInnerHTML={{ __html: hit._highlightResult?.title?.value || hit.title }} />
                    {hit.content && (
                      <div className="text-xs text-gray-600 truncate mt-1">
                        {hit.content.substring(0, 100)}...
                      </div>
                    )}
                  </Link>
                </li>
              ))}
              
              {/* View all results link */}
              {results.length > 0 && (
                <li className="bg-gray-50">
                  <Link 
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="block px-4 py-2 text-center text-sm text-blue-600 hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    View all results for "{query}"
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}