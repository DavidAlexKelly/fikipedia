// src/app/wiki/[title]/history/page.jsx
import { getArticleByTitle, getArticleRevisions } from '@/actions/articleActions';
import ArticleHistoryClientView from '@/components/article/ArticleHistoryClientView';

export async function generateMetadata({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  return {
    title: `History: ${title} - Fikipedia`,
    description: `View the edit history of ${title} on Fikipedia.`,
  };
}

export default async function ArticleHistoryPage({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  // Fetch the article using server action
  const article = await getArticleByTitle(title);
  
  // If article exists, fetch its revisions
  let revisions = [];
  if (article) {
    revisions = await getArticleRevisions(article.id);
  }
  
  return <ArticleHistoryClientView 
    title={title} 
    article={article} 
    initialRevisions={revisions} 
  />;
}