// /components/category/CategoryClientView.jsx
'use client';

import { memo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Format date for consistency
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Empty category state component
const EmptyCategoryState = memo(({ category }) => (
  <div className="bg-white border border-gray-300 rounded p-6 text-center">
    <p className="text-gray-600 mb-4">There are no articles in this category yet.</p>
    <div className="flex justify-center">
      <Link 
        href="/create" 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create an article in this category
      </Link>
    </div>
  </div>
));

EmptyCategoryState.displayName = 'EmptyCategoryState';

// Category info component
const CategoryInfo = memo(({ category, articleCount }) => (
  <div className="mt-8 p-4 bg-gray-50 border border-gray-300 rounded">
    <h2 className="text-xl font-serif mb-3">About this category</h2>
    <p className="text-sm">
      This category contains articles related to <strong>{category}</strong>. 
      Categories help organize content and make it easier to find related articles.
    </p>
    
    <div className="mt-4">
      <h3 className="font-medium text-sm mb-2">Category guidelines</h3>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Categories should be specific and descriptive</li>
        <li>Articles can belong to multiple categories</li>
        <li>Categories can have subcategories</li>
        <li>Category names are case-sensitive</li>
      </ul>
    </div>
  </div>
));

CategoryInfo.displayName = 'CategoryInfo';

// Article list item component
const ArticleListItem = memo(({ article, category }) => (
  <li key={article.id} className="p-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <div>
        <Link 
          href={`/wiki/${encodeURIComponent(article.title)}`} 
          className="text-lg text-blue-600 hover:underline font-medium"
        >
          {article.title}
        </Link>
        
        {/* Brief excerpt if available */}
        {article.content && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {article.content.substring(0, 150)}
            {article.content.length > 150 ? '...' : ''}
          </p>
        )}
        
        {/* Other categories */}
        {article.categories && article.categories.length > 1 && (
          <div className="mt-2 text-xs">
            <span className="text-gray-500">Also in: </span>
            {article.categories
              .filter(cat => cat !== category)
              .map((cat, index, array) => (
                <span key={index}>
                  <Link href={`/category/${encodeURIComponent(cat)}`} className="text-blue-600 hover:underline">
                    {cat}
                  </Link>
                  {index < array.length - 1 ? ', ' : ''}
                </span>
              ))}
          </div>
        )}
      </div>
      
      <div className="mt-2 sm:mt-0 text-xs text-gray-500 sm:text-right">
        <div>Last modified: {formatDate(article.lastModified)}</div>
        <div className="mt-1">
          by <Link href={`/user/${article.lastEditor}`} className="text-blue-600 hover:underline">{article.lastEditor}</Link>
        </div>
      </div>
    </div>
  </li>
));

ArticleListItem.displayName = 'ArticleListItem';

// Main category page component
export default function CategoryClientView({ category, articles = [], categoryInfo }) {
  const articleCount = categoryInfo?.articleCount || articles.length;
  
  if (!category) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h2 className="text-xl font-bold mb-2">Invalid Category</h2>
              <p>No category specified.</p>
              <div className="mt-4">
                <Link href="/" className="text-blue-600 hover:underline">
                  Return to Main Page
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
          <h1 className="text-3xl font-serif mb-6">Category: {category}</h1>
          
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {articleCount} {articleCount === 1 ? 'article' : 'articles'} in this category
            </div>
            
            <Link href="/categories" className="text-blue-600 hover:underline text-sm">
              View all categories
            </Link>
          </div>
          
          {articles.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded">
              <ul className="divide-y divide-gray-200">
                {articles.map(article => (
                  <ArticleListItem 
                    key={article.id} 
                    article={article} 
                    category={category} 
                  />
                ))}
              </ul>
            </div>
          ) : (
            <EmptyCategoryState category={category} />
          )}
          
          <CategoryInfo category={category} articleCount={articleCount} />
        </div>
      </main>
      
      <Footer />
    </>
  );
}