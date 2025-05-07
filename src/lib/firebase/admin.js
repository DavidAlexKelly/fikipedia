/**
 * IMPORTANT: This module should only be imported by repository files.
 * Other parts of the application should access data through repositories
 * and server actions, not directly through Firebase.
 */

// src/lib/firebase/admin.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
let adminApp;
let adminDb;
let adminAuth;
let adminStorage;

// Use a function to initialize to prevent multiple initializations
function initializeFirebaseAdmin() {
  try {
    // Check if Firebase Admin is already initialized
    const apps = getApps();
    
    if (apps.length === 0) {
      // Service account setup
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      adminApp = apps[0];
    }
    
    // Initialize Firestore
    adminDb = getFirestore();
    
    // Initialize other services
    adminAuth = getAuth();
    adminStorage = getStorage();
    
    // Add Firestore field values to adminDb for convenience
    adminDb.FieldValue = FieldValue;
    adminDb.Timestamp = Timestamp;
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// Run initialization only once
if (!adminDb) {
  initializeFirebaseAdmin();
}

// Export the initialized services
export { adminApp, adminDb, adminAuth, adminStorage };