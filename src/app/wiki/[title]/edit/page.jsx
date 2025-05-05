// src/app/wiki/[title]/edit/page.jsx
import { getArticleByTitle } from '@/services/server/articleService';
import ArticleEditClientView from '@/components/article/ArticleEditClientView';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function generateMetadata({ params }) {
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  const article = await getArticleByTitle(title);
  
  return {
    title: article 
      ? `Editing: ${title} - Fikipedia` 
      : `Creating: ${title} - Fikipedia`,
    description: article
      ? `Edit the article about ${title} on Fikipedia.`
      : `Create a new article about ${title} on Fikipedia.`
  };
}

export default async function EditArticlePage({ params }) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  // Get title parameter
  const title = (await params)?.title ? decodeURIComponent((await params).title) : '';
  
  // Redirect if not authenticated
  if (!session) {
    const callbackUrl = `/wiki/${encodeURIComponent(title)}/edit`;
    return redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  // Fetch the article if it exists
  const article = await getArticleByTitle(title);
  
  return <ArticleEditClientView title={title} initialArticle={article} />;
}