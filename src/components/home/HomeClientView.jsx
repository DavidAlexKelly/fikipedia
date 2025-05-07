// src/components/home/HomeClientView.jsx
'use client';

import Link from 'next/link';
import { useSiteStats } from '@/hooks/data/useWiki';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomeClientView({ initialStats }) {
  // Use React Query with initial data from server
  const { 
    data: stats = initialStats || { 
      articleCount: 0, 
      userCount: 0, 
      revisionCount: 0, 
      categoryCount: 0 
    },
    isLoading, 
    error 
  } = useSiteStats({
    initialData: initialStats
  });
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <div className="w-full md:w-44 md:flex-shrink-0 md:pr-6 mb-6 md:mb-0">
            <div className="bg-white border border-gray-300 rounded p-3 mb-4">
              <h3 className="font-bold text-sm mb-2 border-b pb-1">Navigation</h3>
              <ul className="text-sm">
                <li className="my-1"><Link href="/" className="text-blue-600 hover:underline">Main Page</Link></li>
                <li className="my-1"><Link href="/contents" className="text-blue-600 hover:underline">Contents</Link></li>
                <li className="my-1"><Link href="/featured" className="text-blue-600 hover:underline">Featured content</Link></li>
                <li className="my-1"><Link href="/random" className="text-blue-600 hover:underline">Random article</Link></li>
                <li className="my-1"><Link href="/about" className="text-blue-600 hover:underline">About Fikipedia</Link></li>
                <li className="my-1"><Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link></li>
              </ul>
            </div>

            <div className="bg-white border border-gray-300 rounded p-3 mb-4">
              <h3 className="font-bold text-sm mb-2 border-b pb-1">Contribute</h3>
              <ul className="text-sm">
                <li className="my-1"><Link href="/help" className="text-blue-600 hover:underline">Help</Link></li>
                <li className="my-1"><Link href="/community" className="text-blue-600 hover:underline">Community portal</Link></li>
                <li className="my-1"><Link href="/changes" className="text-blue-600 hover:underline">Recent changes</Link></li>
                <li className="my-1"><Link href="/upload" className="text-blue-600 hover:underline">Upload file</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow">
            <div className="bg-white border border-gray-300 rounded p-6 mb-6">
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <div className="mx-auto w-24 h-24 flex items-center justify-center mb-4 bg-gray-100 rounded-full border border-gray-300">
                  <span className="text-4xl font-serif">F</span>
                </div>
                <h1 className="text-4xl font-serif mb-3">Welcome to Fikipedia</h1>
                <p className="text-gray-600 mb-6">The Free Fictional Encyclopedia that anyone can edit.</p>
                
                {/* Search Box */}
                <div className="max-w-md mx-auto relative">
                  <form action="/search" method="GET">
                    <input 
                      type="text" 
                      name="q"
                      placeholder="Search Fikipedia" 
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                    />
                    <button 
                      type="submit" 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      aria-label="Search"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </form>
                </div>
              </div>

              {/* Featured Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="text-xl font-serif mb-3">Featured Article</h3>
                  <p className="text-sm mb-3">
                    <strong>The Kingdom of Eldoria</strong> is a fictional medieval realm created by fantasy author J.R. Tolkien in his bestselling series "Chronicles of the Lost Crown." Established in the Third Age after the Great Cataclysm...
                  </p>
                  <Link href="/wiki/Kingdom_of_Eldoria" className="text-blue-600 hover:underline text-sm">Read more →</Link>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="text-xl font-serif mb-3">Did you know...</h3>
                  <ul className="text-sm list-disc pl-5 space-y-2">
                    <li>...that the fictional language Elvish has over 10,000 words created for various fictional settings?</li>
                    <li>...that the city of New Prometheus appears in over 50 different science fiction novels by different authors?</li>
                    <li>...that the most linked fictional character on Fikipedia is Detective Alex Morgan, who appears in 15 different fictional universes?</li>
                  </ul>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="text-lg font-serif mb-2">Fikipedia Statistics</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{stats.articleCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.userCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.revisionCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Edits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.categoryCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="text-lg font-serif mb-2">Getting Started</h3>
                  <ul className="text-sm space-y-1">
                    <li><Link href="/help/create-account" className="text-blue-600 hover:underline">Create an account</Link></li>
                    <li><Link href="/help/editing" className="text-blue-600 hover:underline">Learn to edit</Link></li>
                    <li><Link href="/help/article-guidelines" className="text-blue-600 hover:underline">Article guidelines</Link></li>
                    <li><Link href="/create" className="text-blue-600 hover:underline">Create new article</Link></li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="text-lg font-serif mb-2">Popular Categories</h3>
                  <ul className="text-sm space-y-1">
                    <li><Link href="/category/Alternate_History" className="text-blue-600 hover:underline">Alternate History</Link></li>
                    <li><Link href="/category/Science_Fiction" className="text-blue-600 hover:underline">Science Fiction</Link></li>
                    <li><Link href="/category/Fantasy" className="text-blue-600 hover:underline">Fantasy</Link></li>
                    <li><Link href="/category/Fictional_Countries" className="text-blue-600 hover:underline">Fictional Countries</Link></li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="text-lg font-serif mb-2">Community</h3>
                  <ul className="text-sm space-y-1">
                    <li><Link href="/community/portal" className="text-blue-600 hover:underline">Community Portal</Link></li>
                    <li><Link href="/community/projects" className="text-blue-600 hover:underline">Current Projects</Link></li>
                    <li><Link href="/community/discussions" className="text-blue-600 hover:underline">Discussions</Link></li>
                    <li><Link href="/help/faq" className="text-blue-600 hover:underline">FAQ</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}