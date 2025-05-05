// src/app/wiki/[title]/page.jsx
import { getArticleByTitle } from '@/services/server/articleService';
import { parseWikiMarkup, extractHeadings } from '@/lib/wiki/parser';
import ArticleClientView from '@/components/article/ArticleClientView';
import ArticleNotFound from '@/components/article/ArticleNotFound';

export async function generateMetadata({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  // Fetch article to get metadata
  const article = await getArticleByTitle(title);
  
  return {
    title: article ? `${title} - Fikipedia` : `${title} - Not Found - Fikipedia`,
    description: article 
      ? `Learn about ${title} on Fikipedia, the free fictional encyclopedia.`
      : `Create an article about ${title} on Fikipedia, the free fictional encyclopedia.`,
  };
}

export default async function ArticlePage({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  // Directly use server service to fetch article
  const article = await getArticleByTitle(title);
  
  if (!article) {
    return <ArticleNotFound title={title} />;
  }
  
  // Process content on the server
  const contentHtml = await parseWikiMarkup(article.content);
  const headings = extractHeadings(article.content);
  
  // Pass pre-rendered content to client component
  return <ArticleClientView article={article} contentHtml={contentHtml} headings={headings} />;
}