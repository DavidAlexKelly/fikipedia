// src/app/category/[category]/page.jsx
import { getCategoryInfo, getArticlesByCategory } from '@/actions/categoryActions';
import CategoryClientView from '@/components/category/CategoryClientView';

export async function generateMetadata({ params }) {
  const category = (await params)?.category ? decodeURIComponent((await params).category) : '';
  
  const categoryInfo = await getCategoryInfo(category);
  
  return {
    title: `${category} - Category - Fikipedia`,
    description: `Browse articles in the ${category} category on Fikipedia. ${
      categoryInfo?.articleCount ? `Contains ${categoryInfo.articleCount} articles.` : ''
    }`
  };
}

export default async function CategoryPage({ params }) {
  const category = (await params)?.category ? decodeURIComponent((await params).category) : '';
  
  // Server-side data fetching using server actions
  const articles = await getArticlesByCategory(category);
  const categoryInfo = await getCategoryInfo(category);
  
  // Pass data to client component
  return <CategoryClientView 
    category={category} 
    articles={articles}
    categoryInfo={categoryInfo}
  />;
}