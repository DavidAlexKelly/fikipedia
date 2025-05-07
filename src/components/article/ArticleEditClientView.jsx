// src/components/article/ArticleEditClientView.jsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCreateArticle, useUpdateArticle } from '@/hooks/data/useArticle';
import { parseWikiMarkup } from '@/lib/wiki/parser';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WikiToolbar from '@/components/article/WikiToolbar';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

export default function ArticleEditClientView({ title, initialArticle = null }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [summary, setSummary] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isMinorEdit, setIsMinorEdit] = useState(false);
  const [error, setError] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  
  // Use the mutation hooks
  const { 
    mutate: createArticle, 
    isPending: createPending,
    error: createError
  } = useCreateArticle();
  
  const {
    mutate: updateArticle,
    isPending: updatePending,
    error: updateError
  } = useUpdateArticle();
  
  // Memoize if this is a new article
  const isNewArticle = useMemo(() => !initialArticle, [initialArticle]);
  
  // Initialize form values
  useEffect(() => {
    if (initialArticle) {
      setContent(initialArticle.content || '');
      setCategories(initialArticle.categories?.join(', ') || '');
      setSummary(isNewArticle ? 'Initial article creation' : '');
    } else {
      // If we're creating a new article, set default content
      const defaultContent = `== Introduction ==\nBrief introduction to ${title}.\n\n== History ==\nHistorical background of ${title}.\n\n== Characteristics ==\nDetails about ${title}.`;
      setContent(defaultContent);
      setSummary('Initial article creation');
    }
  }, [initialArticle, isNewArticle, title]);
  
  // Update preview content when in preview mode
  useEffect(() => {
    async function updatePreview() {
      if (previewMode && content) {
        try {
          const parsed = await parseWikiMarkup(content);
          setPreviewContent(parsed);
        } catch (err) {
          console.error("Error parsing wiki markup:", err);
          setPreviewContent('<div class="text-red-600">Error generating preview</div>');
        }
      }
    }
    
    updatePreview();
  }, [previewMode, content]);
  
  // Handle error from mutations
  useEffect(() => {
    const mutationError = createError || updateError;
    if (mutationError) {
      setError(mutationError.message || 'Failed to save article');
    }
  }, [createError, updateError]);
  
  // Memoized handlers for form inputs
  const handleCategoryChange = useCallback((e) => {
    setCategories(e.target.value);
  }, []);
  
  const handleContentChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);
  
  const handleSummaryChange = useCallback((e) => {
    setSummary(e.target.value);
  }, []);
  
  const handleMinorEditChange = useCallback((e) => {
    setIsMinorEdit(e.target.checked);
  }, []);
  
  // Process categories from comma-separated string to array
  const processCategories = useCallback(() => {
    return categories
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);
  }, [categories]);
  
  // Toggle preview mode
  const togglePreviewMode = useCallback((mode) => {
    setPreviewMode(mode);
  }, []);
  
  // Handle article save
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      const categoryArray = processCategories();
      
      if (isNewArticle) {
        // Create new article
        createArticle(
          { 
            title: title,
            content: content,
            categories: categoryArray,
            summary: summary || "Created article"
          },
          {
            onSuccess: () => {
              router.push(`/wiki/${encodeURIComponent(title)}`);
            }
          }
        );
      } else {
        // Update existing article
        updateArticle(
          {
            articleId: initialArticle.id,
            updates: {
              content: content,
              categories: categoryArray,
            },
            summary: summary || (isMinorEdit ? "Minor edit" : "Updated article")
          },
          {
            onSuccess: () => {
              router.push(`/wiki/${encodeURIComponent(title)}`);
            }
          }
        );
      }
    } catch (err) {
      console.error("Error saving article:", err);
      setError(err.message || "Failed to save article");
    }
  }, [
    processCategories, 
    isNewArticle, 
    title, 
    content, 
    summary, 
    isMinorEdit, 
    initialArticle, 
    router,
    createArticle,
    updateArticle
  ]);
  
  // Memoized WikiToolbar action handler
  const insertWikiMarkup = useCallback((markupType) => {
    const textArea = document.getElementById('article-editor');
    if (!textArea) return;
    
    const selectionStart = textArea.selectionStart;
    const selectionEnd = textArea.selectionEnd;
    const selectedText = content.substring(selectionStart, selectionEnd);
    
    let newText;
    
    switch (markupType) {
      case 'bold':
        newText = `'''${selectedText}'''`;
        break;
      case 'italic':
        newText = `''${selectedText}''`;
        break;
      case 'link':
        newText = `[[${selectedText}]]`;
        break;
      case 'externalLink':
        newText = `[https://example.com ${selectedText || 'link text'}]`;
        break;
      case 'heading':
        newText = `== ${selectedText || 'Heading'} ==`;
        break;
      case 'subheading':
        newText = `=== ${selectedText || 'Subheading'} ===`;
        break;
      case 'image':
        newText = `[[File:${selectedText || 'example.jpg'}|thumb|Caption]]`;
        break;
      case 'list':
        newText = `* ${selectedText}`;
        break;
      default:
        newText = selectedText;
    }
    
    const newContent = 
      content.substring(0, selectionStart) + 
      newText + 
      content.substring(selectionEnd);
    
    setContent(newContent);
    
    // Focus back on textarea
    setTimeout(() => {
      textArea.focus();
      // Set cursor position after the inserted markup
      const newPosition = selectionStart + newText.length;
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, [content]);
  
  // Memoized categoriesList for display
  const categoriesList = useMemo(() => {
    if (!categories) return [];
    return categories.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
  }, [categories]);
  
  // Combined saving state
  const saving = createPending || updatePending;
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Editor Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-serif mb-2">
              {isNewArticle ? 'Creating' : 'Editing'}: <span className="font-bold">{title}</span>
            </h1>
            <div className="text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Articles should be about fictional content only. Please follow the <Link href="/guidelines" className="text-blue-600 hover:underline">community guidelines</Link>.</span>
            </div>
          </div>
          
          {/* Error alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <div>{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSave}>
            {/* Edit Tabs */}
            <div className="flex mb-4 border-b border-gray-300">
              <button 
                type="button"
                onClick={() => togglePreviewMode(false)} 
                className={`px-4 py-2 text-sm font-medium flex items-center ${!previewMode ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit
              </button>
              <button 
                type="button"
                onClick={() => togglePreviewMode(true)} 
                className={`px-4 py-2 text-sm font-medium flex items-center ${previewMode ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Preview
              </button>
            </div>
            
            {previewMode ? (
              /* Preview Mode */
              <div className="mb-6 border border-gray-300 rounded">
                <div className="bg-gray-50 p-2 border-b border-gray-300 text-sm font-medium">
                  Article Preview
                </div>
                <div className="p-4">
                  <h1 className="text-3xl font-serif mb-4 pb-1 border-b border-gray-300">{title}</h1>
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                  
                  {categoriesList.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-gray-300">
                      <div className="text-sm">
                        <strong>Categories:</strong> {categoriesList.map((cat, i) => (
                          <span key={i} className="inline-block mr-2">
                            <Link href={`/category/${encodeURIComponent(cat)}`} className="text-blue-600 hover:underline">
                              {cat}
                            </Link>
                            {i < categoriesList.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="mb-6">
                <label htmlFor="article-editor" className="block text-sm font-medium mb-1">
                  Article Content
                </label>
                
                {/* Toolbar */}
                <WikiToolbar onAction={insertWikiMarkup} />
                
                {/* Editor */}
                <textarea 
                  id="article-editor"
                  value={content}
                  onChange={handleContentChange}
                  className="w-full h-96 p-3 border border-gray-300 rounded-b font-mono text-sm"
                  placeholder={`Start your article here...\n\n== Introduction ==\nBrief introduction to ${title}.\n\n== History ==\nHistorical background of ${title}.\n\n== Characteristics ==\nDetails about ${title}.`}
                  required
                ></textarea>
                
                <div className="mt-2 text-xs text-gray-600">
                  Use wiki markup for formatting. See the <Link href="/help/wiki-syntax" className="text-blue-600 hover:underline">formatting guide</Link> for help.
                </div>
              </div>
            )}
            
            {/* Categories Section */}
            <div className="mb-6">
              <label htmlFor="categories" className="block text-sm font-medium mb-1">
                Categories (comma-separated):
              </label>
              <input 
                type="text"
                id="categories"
                value={categories}
                onChange={handleCategoryChange}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="e.g. Fictional Countries, Alternate History, Science Fiction"
              />
            </div>
            
            {/* Edit Summary */}
            <div className="mb-6">
              <label htmlFor="edit-summary" className="block text-sm font-medium mb-1">
                Edit summary (briefly describe your changes):
              </label>
              <input 
                type="text"
                id="edit-summary"
                value={summary}
                onChange={handleSummaryChange}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder={isNewArticle ? "Initial article creation" : "Fixed typo, added content, etc."}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  isLoading={saving}
                  disabled={saving}
                >
                  {isNewArticle ? 'Create Article' : 'Save Changes'}
                </Button>
                <Link
                  href={isNewArticle ? '/' : `/wiki/${encodeURIComponent(title)}`}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 inline-block"
                >
                  Cancel
                </Link>
              </div>
              
              {!isNewArticle && (
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="minor-edit" 
                    checked={isMinorEdit}
                    onChange={handleMinorEditChange}
                    className="mr-2" 
                  />
                  <label htmlFor="minor-edit" className="text-sm">This is a minor edit</label>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </>
  );
}