// src/app/create/page.jsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions'
import ArticleEditClientView from '@/components/article/ArticleEditClientView';

export const metadata = {
  title: 'Create New Article - Fikipedia',
  description: 'Create a new article on Fikipedia, the free fictional encyclopedia.',
};

export default async function CreatePage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session) {
    return redirect('/login?callbackUrl=/create');
  }
  
  // Using the existing ArticleEditClientView component with no initial article
  return <ArticleEditClientView title="" initialArticle={null} />;
}