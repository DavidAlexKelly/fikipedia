// src/lib/wiki/parser.js
import { marked } from 'marked';

// Dynamic import for DOMPurify with proper server/client handling
let DOMPurify;

// Initialize DOMPurify based on environment
async function initDOMPurify() {
  if (typeof window === 'undefined') {
    // Server side
    const { JSDOM } = await import('jsdom');
    const createDOMPurify = (await import('dompurify')).default;
    const window = new JSDOM('').window;
    DOMPurify = createDOMPurify(window);
  } else {
    // Client side
    DOMPurify = (await import('dompurify')).default;
  }
}

// Initialize immediately
initDOMPurify();

// Parse wiki markup with sanitization
export async function parseWikiMarkup(wikiText) {
  if (!wikiText) return '';
  
  // Ensure DOMPurify is initialized
  if (!DOMPurify) {
    await initDOMPurify();
  }
  
  // Create a custom renderer
  const renderer = new marked.Renderer();
  
  // Override the link renderer to handle wiki links
  renderer.link = function(href, title, text) {
    if (href.startsWith('wiki:')) {
      const pageName = href.substring(5);
      return `<a href="/wiki/${encodeURIComponent(pageName)}" class="internal-link">${text}</a>`;
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="external-link">${text}</a>`;
  };
  
  // Process wiki links [[...]]
  const processedText = wikiText.replace(
    /\[\[(.*?)([\|](.*?))?\]\]/g, 
    (match, linkTarget, _, linkText) => {
      return `[${linkText || linkTarget}](wiki:${linkTarget})`;
    }
  );
  
  // Set options for marked
  const options = {
    renderer,
    gfm: true,
    breaks: true,
  };
  
  // Convert to HTML
  const rawHtml = marked(processedText, options);
  
  // Sanitize HTML to prevent XSS
  return DOMPurify.sanitize(rawHtml);
}

// Function to extract headings for table of contents
export function extractHeadings(wikiText) {
  if (!wikiText) return [];
  
  const headings = [];
  const h2Regex = /==\s*(.*?)\s*==/g;
  const h3Regex = /===\s*(.*?)\s*===/g;
  
  let h2Match;
  let lastIndex = 0;
  
  while ((h2Match = h2Regex.exec(wikiText)) !== null) {
    const heading = {
      title: h2Match[1],
      id: h2Match[1].toLowerCase().replace(/\s+/g, '-'),
      level: 2,
      subheadings: []
    };
    
    // Store the end index of this match
    const currentMatchEndIndex = h2Regex.lastIndex;
    
    // Find the next h2 match
    const nextH2Match = h2Regex.exec(wikiText);
    
    // Determine the end of the current section
    const sectionEndIndex = nextH2Match ? nextH2Match.index : wikiText.length;
    
    // If we found a next match, reset the regex lastIndex to where it was
    if (nextH2Match) {
      h2Regex.lastIndex = lastIndex = currentMatchEndIndex;
    }
    
    // Extract the current section content
    const sectionContent = wikiText.substring(currentMatchEndIndex, sectionEndIndex);
    
    // Find h3 headings in this section
    let h3Match;
    while ((h3Match = h3Regex.exec(sectionContent)) !== null) {
      heading.subheadings.push({
        title: h3Match[1],
        id: h3Match[1].toLowerCase().replace(/\s+/g, '-'),
        level: 3
      });
    }
    
    headings.push(heading);
  }
  
  return headings;
}