// src/repositories/baseRepository.js
import { adminDb } from '@/lib/firebase/admin';
import { serializeDate } from '@/lib/serializers';

export class BaseRepository {
  constructor(collectionName) {
    this.collection = adminDb.collection(collectionName);
  }

  async findById(id) {
    try {
      if (!id) return null;
      
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      
      return this.serializeDocument(doc);
    } catch (error) {
      console.error(`Error in findById: ${error}`);
      throw error;
    }
  }

  async findAll(limit = 100) {
    try {
      const snapshot = await this.collection.limit(limit).get();
      return snapshot.docs.map(doc => this.serializeDocument(doc));
    } catch (error) {
      console.error(`Error in findAll: ${error}`);
      throw error;
    }
  }

  // Helper method to serialize document data
  serializeDocument(doc) {
    if (!doc || !doc.exists) return null;
    
    const data = doc.data();
    const serialized = { id: doc.id, ...data };
    
    // Process dates
    Object.keys(serialized).forEach(key => {
      if (serialized[key] && typeof serialized[key].toDate === 'function') {
        serialized[key] = serializeDate(serialized[key]);
      }
    });
    
    return serialized;
  }
}