// src/app/wiki/[title]/talk/page.jsx
import { getArticleByTitle } from '@/services/server/articleService';
import ArticleTalkClientView from '@/components/article/ArticleTalkClientView';

export async function generateMetadata({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  return {
    title: `Talk: ${title} - Fikipedia`,
    description: `Discussion about ${title} on Fikipedia.`,
  };
}

export default async function ArticleTalkPage({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  // Fetch the article
  const article = await getArticleByTitle(title);
  
  return <ArticleTalkClientView title={title} article={article} />;
}