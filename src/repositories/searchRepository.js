// src/repositories/searchRepository.js
import { adminDb } from '@/lib/firebase/admin';
import { normalizeString } from '@/lib/serializers';

export class SearchRepository {
  async searchArticles(query, limit = 20) {
    if (!query || query.trim() === '') return [];
    
    try {
      const normalizedQuery = normalizeString(query);
      
      // Search by title first (most relevant)
      const titleQuerySnapshot = await adminDb.collection('articles')
        .where('normalizedTitle', '>=', normalizedQuery)
        .where('normalizedTitle', '<=', normalizedQuery + '\uf8ff')
        .limit(limit)
        .get();
      
      const results = titleQuerySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content?.substring(0, 200) || '',
          lastModified: data.lastModified?.toDate()?.toISOString() || new Date().toISOString(),
          categories: data.categories || []
        };
      });
      
      // If we didn't get enough results, try to find more
      if (results.length < limit) {
        // This is a simplistic approach - in a real app, you'd use a proper search service
        const contentQuerySnapshot = await adminDb.collection('articles')
          .orderBy('lastModified', 'desc')
          .limit(100)
          .get();
        
        // Filter locally for content matches
        const contentMatches = contentQuerySnapshot.docs
          .filter(doc => {
            // Skip if already in results
            if (results.some(r => r.id === doc.id)) return false;
            
            const data = doc.data();
            const content = data.content || '';
            return content.toLowerCase().includes(normalizedQuery);
          })
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              content: data.content?.substring(0, 200) || '',
              lastModified: data.lastModified?.toDate()?.toISOString() || new Date().toISOString(),
              categories: data.categories || []
            };
          })
          .slice(0, limit - results.length);
        
        // Combine results
        results.push(...contentMatches);
      }
      
      return results;
    } catch (error) {
      console.error("Error searching articles:", error);
      throw error;
    }
  }
}

export const searchRepository = new SearchRepository();