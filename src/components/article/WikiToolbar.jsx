// src/components/article/WikiToolbar.jsx
'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';

// Icon component to reduce duplication
const ToolbarIcon = memo(({ children, onClick, title, ariaLabel }) => (
  <button 
    type="button" 
    onClick={onClick}
    className="p-1.5 hover:bg-gray-200 rounded mr-1"
    title={title}
    aria-label={ariaLabel || title}
  >
    {children}
  </button>
));

ToolbarIcon.displayName = 'ToolbarIcon';

// Bold icon component
const BoldIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
  </svg>
));

BoldIcon.displayName = 'BoldIcon';

// Italic icon component
const ItalicIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="4" x2="10" y2="4"></line>
    <line x1="14" y1="20" x2="5" y2="20"></line>
    <line x1="15" y1="4" x2="9" y2="20"></line>
  </svg>
));

ItalicIcon.displayName = 'ItalicIcon';

// Link icon component
const LinkIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
));

LinkIcon.displayName = 'LinkIcon';

// Main WikiToolbar component
const WikiToolbar = memo(({ onAction }) => {
  // Memoize button click handlers to prevent unnecessary re-renders
  const handleBoldClick = useCallback(() => onAction('bold'), [onAction]);
  const handleItalicClick = useCallback(() => onAction('italic'), [onAction]);
  const handleLinkClick = useCallback(() => onAction('link'), [onAction]);
  const handleExternalLinkClick = useCallback(() => onAction('externalLink'), [onAction]);
  const handleHeadingClick = useCallback(() => onAction('heading'), [onAction]);
  const handleSubheadingClick = useCallback(() => onAction('subheading'), [onAction]);
  const handleImageClick = useCallback(() => onAction('image'), [onAction]);
  const handleListClick = useCallback(() => onAction('list'), [onAction]);

  return (
    <div className="flex flex-wrap items-center p-2 mb-2 bg-gray-50 border border-gray-300 rounded-t">
      <ToolbarIcon 
        onClick={handleBoldClick}
        title="Bold text"
      >
        <BoldIcon />
      </ToolbarIcon>
      
      <ToolbarIcon 
        onClick={handleItalicClick}
        title="Italic text"
      >
        <ItalicIcon />
      </ToolbarIcon>
      
      <ToolbarIcon 
        onClick={handleLinkClick}
        title="Internal link"
      >
        <LinkIcon />
      </ToolbarIcon>
      
      <ToolbarIcon 
        onClick={handleHeadingClick}
        title="Section heading"
        className="ml-2"
      >
        <span className="font-bold">H2</span>
      </ToolbarIcon>
      
      <ToolbarIcon 
        onClick={handleSubheadingClick}
        title="Subsection heading"
      >
        <span className="font-bold">H3</span>
      </ToolbarIcon>
      
      <div className="flex-grow"></div>
      
      <Link 
        href="/help/wiki-syntax"
        target="_blank"
        className="p-1.5 text-sm text-blue-600 hover:underline flex items-center"
        title="Wiki syntax help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>Editing help</span>
      </Link>
    </div>
  );
});

WikiToolbar.displayName = 'WikiToolbar';

export default WikiToolbar;