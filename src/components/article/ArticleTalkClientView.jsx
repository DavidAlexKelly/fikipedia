// src/components/article/ArticleTalkClientView.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getArticleComments, addComment } from '@/actions/articleActions'; // Direct server action imports
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ArticleTalkClientView({ title, article }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      if (!article?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // This would be a call to the future getArticleComments action
        // const commentData = await getArticleComments(article.id);
        // setComments(commentData || []);
        
        // For now, just use placeholder data
        setComments([]);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError(err.message || 'Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [article?.id]);
  
  // Handle input change
  const handleCommentChange = useCallback((e) => {
    setNewComment(e.target.value);
  }, []);
  
  // Handle comment submission
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    
    if (!session) {
      // Redirect to login if not signed in
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // This would be a call to the future addComment action
      // await addComment({
      //   articleId: article.id,
      //   content: newComment
      // });
      
      // Placeholder implementation
      setComments(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: newComment,
          createdAt: new Date().toISOString(),
          author: session.user.name,
          authorId: session.user.id
        }
      ]);
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, session, article?.id]);
  
  if (!article) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h2 className="text-xl font-bold mb-2">Article Not Found</h2>
              <p>The article "{title}" does not exist yet.</p>
              <div className="mt-4">
                <Link href={`/wiki/${encodeURIComponent(title)}/edit`} className="text-blue-600 hover:underline">
                  Create this article
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
          <h1 className="text-3xl font-serif mb-3">Talk: {title}</h1>
          
          {/* Article tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <Link href={`/wiki/${encodeURIComponent(title)}`} className="mr-4 text-gray-500 hover:text-gray-900 pb-2">
              Article
            </Link>
            <div className="mr-4 border-b-2 border-blue-500 pb-2 text-blue-600 font-medium">
              Talk
            </div>
            <Link href={`/wiki/${encodeURIComponent(title)}/edit`} className="mr-4 text-gray-500 hover:text-gray-900 pb-2">
              Edit
            </Link>
            <Link href={`/wiki/${encodeURIComponent(title)}/history`} className="mr-4 text-gray-500 hover:text-gray-900 pb-2">
              History
            </Link>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 py-3 px-4 border-b border-gray-300">
              <h2 className="font-medium">Discussion about {title}</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading comments...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">
                  {error}
                </div>
              ) : comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Link href={`/user/${comment.authorId}`} className="font-medium text-blue-600 hover:underline">
                        {comment.author}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {comment.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  There are no comments on this article yet. Be the first to start a discussion!
                </div>
              )}
            </div>
          </div>
          
          {/* Comment form */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 py-3 px-4 border-b border-gray-300">
              <h2 className="font-medium">Add a comment</h2>
            </div>
            
            <div className="p-4">
              {session ? (
                <form onSubmit={handleSubmitComment}>
                  <div className="mb-3">
                    <textarea
                      value={newComment}
                      onChange={handleCommentChange}
                      className="w-full p-3 border border-gray-300 rounded"
                      rows={4}
                      placeholder="Write your comment here..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-3 text-gray-600">You need to be logged in to comment.</p>
                  <Link 
                    href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Sign In to Comment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}