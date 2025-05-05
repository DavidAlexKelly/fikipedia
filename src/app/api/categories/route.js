// /app/api/categories/route.js
import { NextResponse } from 'next/server';
import { getAllCategories } from '@/services/server/categoryService';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}