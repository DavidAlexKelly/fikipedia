// src/components/article/TableOfContents.jsx
'use client';

import { useState, useCallback, memo, useMemo } from 'react';

// Memoized subheading component to avoid unnecessary re-renders
const SubHeadingItem = memo(({ subheading, index }) => {
  return (
    <li key={`subheading-${index}`} className="my-1">
      <a href={`#${subheading.id}`} className="text-blue-600 hover:underline">
        {subheading.title}
      </a>
    </li>
  );
});

SubHeadingItem.displayName = 'SubHeadingItem';

// Memoized heading component to avoid unnecessary re-renders
const HeadingItem = memo(({ heading, index }) => {
  const hasSubheadings = heading.subheadings && heading.subheadings.length > 0;
  
  return (
    <li key={`heading-${index}`} className="my-1">
      <a href={`#${heading.id}`} className="text-blue-600 hover:underline">
        {heading.title}
      </a>
      
      {hasSubheadings && (
        <ol className="list-decimal list-inside pl-4 mt-1">
          {heading.subheadings.map((subheading, subIndex) => (
            <SubHeadingItem 
              key={`${index}-${subIndex}`}
              subheading={subheading}
              index={subIndex}
            />
          ))}
        </ol>
      )}
    </li>
  );
});

HeadingItem.displayName = 'HeadingItem';

// Main TableOfContents component
const TableOfContents = memo(({ headings }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Memoize the toggle function to avoid recreating on each render
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // Memoize whether we have valid headings to display
  const hasHeadings = useMemo(() => {
    return headings && headings.length > 0;
  }, [headings]);
  
  // Early return if no headings
  if (!hasHeadings) {
    return null;
  }
  
  // Calculate heading count for the collapsed view
  const headingCount = headings.length;
  
  return (
    <div className="border border-gray-300 bg-gray-50 rounded p-3 mb-6">
      <div 
        className="font-medium text-sm mb-2 cursor-pointer flex items-center" 
        onClick={toggleExpanded}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <span className="mr-1">{isExpanded ? '−' : '+'}</span>
        Contents {!isExpanded && `[${headingCount}]`}
      </div>
      
      {isExpanded && (
        <ol className="list-decimal list-inside text-sm">
          {headings.map((heading, index) => (
            <HeadingItem 
              key={`heading-${index}`}
              heading={heading}
              index={index}
            />
          ))}
        </ol>
      )}
    </div>
  );
});

// Add display name for better debugging
TableOfContents.displayName = 'TableOfContents';

export default TableOfContents;