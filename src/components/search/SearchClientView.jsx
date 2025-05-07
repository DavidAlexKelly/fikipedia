// src/components/search/SearchClientView.jsx
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchArticles } from '@/actions/searchActions'; // Direct server action import
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/common/Loading';

// Format date for consistency
const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Memoized search result component
const SearchResult = memo(({ result }) => {
  const renderCategories = () =>
    result.categories && result.categories.length > 0 ? (
      result.categories.map((category, index) => (
        <span key={index}>
          <Link
            href={`/category/${encodeURIComponent(category)}`}
            className="text-blue-600 hover:underline"
          >
            {category}
          </Link>
          {index < result.categories.length - 1 ? ', ' : ''}
        </span>
      ))
    ) : (
      <span className="italic">None</span>
    );

  return (
    <li className="py-4">
      <div className="mb-1">
        <Link
          href={`/wiki/${encodeURIComponent(result.title)}`}
          className="text-lg text-blue-600 hover:underline font-medium"
        >
          {result.title}
        </Link>
      </div>

      <div className="text-sm text-gray-800 mb-2">
        {result.content ? (
          <span>
            {result.content.substring(0, 200)}
            {result.content.length > 200 ? '...' : ''}
          </span>
        ) : (
          <span className="text-gray-500 italic">No description available</span>
        )}
      </div>

      <div className="flex flex-wrap text-xs text-gray-500 gap-x-3">
        <div>
          <span className="font-medium">Categories:</span> {renderCategories()}
        </div>
        <div>
          <span className="font-medium">Last modified:</span>{' '}
          {result.lastModified ? formatDate(result.lastModified) : 'Unknown date'}
        </div>
      </div>
    </li>
  );
});

SearchResult.displayName = 'SearchResult';

// Empty search results component
const EmptyResults = memo(({ query }) => (
  <div className="py-8 text-center">
    <div className="text-lg font-medium mb-2">No results found for "{query}"</div>
    <p className="text-gray-600 mb-6">
      Your search did not match any articles in Fikipedia.
    </p>
    <div className="bg-white border border-gray-200 rounded p-4 inline-block text-left">
      <h3 className="font-medium mb-2">Suggestions:</h3>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Make sure all words are spelled correctly</li>
        <li>Try different keywords</li>
        <li>Try more general keywords</li>
        <li>Try fewer keywords</li>
      </ul>
      <div className="mt-4">
        <Link
          href={`/wiki/${encodeURIComponent(query)}/edit`}
          className="text-blue-600 hover:underline"
        >
          Create an article about "{query}"
        </Link>
      </div>
    </div>
  </div>
));

EmptyResults.displayName = 'EmptyResults';

// Search form component
const SearchForm = memo(({ defaultValue, onSubmit }) => (
  <form onSubmit={onSubmit} className="flex">
    <input
      type="text"
      name="q"
      defaultValue={defaultValue}
      placeholder="Search Fikipedia"
      className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
    >
      Search
    </button>
  </form>
));

SearchForm.displayName = 'SearchForm';

// Main search component
export default function SearchClientView({ initialQuery = '', initialResults = [] }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const router = useRouter();
  
  // Results per page
  const perPage = 10;
  const pageCount = Math.ceil((results?.length || 0) / perPage);
  const paginatedResults = results ? results.slice(currentPage * perPage, (currentPage + 1) * perPage) : [];

  useEffect(() => {
    // Reset to first page when query changes
    setCurrentPage(0);
  }, [query, filters]);

  // Handle initial search if query is provided
  useEffect(() => {
    if (initialQuery && (!initialResults || initialResults.length === 0)) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, initialResults]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery?.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call server action directly
      const searchResults = await searchArticles(searchQuery, 100);
      setResults(searchResults);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('q');

    if (searchQuery?.trim()) {
      setQuery(searchQuery.trim());
      if (typeof window !== 'undefined') {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
      }
      handleSearch(searchQuery.trim());
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'searchType') {
      setSearchType(value);
      if (value === 'articles') {
        setFilters('isRedirect:false');
      } else if (value === 'categories') {
        setFilters('isCategory:true');
      } else {
        setFilters('');
      }
    } else if (name === 'sortBy') {
      setSortBy(value);
      
      // Apply sorting
      if (results) {
        const sortedResults = [...results];
        if (value === 'date') {
          sortedResults.sort((a, b) => {
            return new Date(b.lastModified) - new Date(a.lastModified);
          });
        } else if (value === 'title') {
          sortedResults.sort((a, b) => a.title.localeCompare(b.title));
        }
        setResults(sortedResults);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif mb-6">Search Results</h1>

          {/* Search Form */}
          <div className="mb-8">
            <SearchForm defaultValue={query} onSubmit={handleSearchSubmit} />
            <div className="mt-2 text-sm text-gray-600">
              {query ? (
                <p>Showing results for "{query}"</p>
              ) : (
                <p>Enter a search term above</p>
              )}
            </div>
          </div>

          {/* Search Filters */}
          {query && (
            <div className="mb-6 bg-gray-50 p-4 border border-gray-200 rounded">
              <div className="text-sm font-medium mb-2">Refine your search</div>
              <div className="flex flex-wrap gap-3">
                <select
                  name="searchType"
                  value={searchType}
                  onChange={handleFilterChange}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-sm"
                >
                  <option value="all">All namespaces</option>
                  <option value="articles">Articles only</option>
                  <option value="categories">Categories</option>
                </select>

                <div className="flex-grow" />

                <select
                  name="sortBy"
                  value={sortBy}
                  onChange={handleFilterChange}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-sm"
                >
                  <option value="relevance">Sort by relevance</option>
                  <option value="date">Sort by date</option>
                  <option value="title">Sort by title</option>
                </select>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query ? (
            isLoading ? (
              <Loading message="Searching..." />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                Error: {error}
              </div>
            ) : results && results.length > 0 ? (
              <div>
                <div className="text-sm text-gray-600 mb-4">
                  {results.length} {results.length === 1 ? 'result' : 'results'} found
                </div>

                <ul className="divide-y divide-gray-200">
                  {paginatedResults.map((result) => (
                    <SearchResult key={result.id} result={result} />
                  ))}
                </ul>

                {pageCount > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage + 1} of {pageCount}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= pageCount - 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyResults query={query} />
            )
          ) : (
            <div className="py-8 text-center text-gray-600">
              Enter a search term to find articles on Fikipedia.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}