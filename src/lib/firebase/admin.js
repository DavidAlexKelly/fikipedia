// /services/firebase/admin.js - Updated version

// Only initialize on server-side
const isServer = typeof window === 'undefined';

// Initialize Firebase services with null defaults
let adminApp = null;
let adminDb = null;
let adminAuth = null;
let adminStorage = null;

// Only import and initialize on server-side
if (isServer) {
  try {
    // Dynamic import for server-side only
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');
    const { getStorage } = require('firebase-admin/storage');
    
    // Check if Firebase Admin is already initialized
    const apps = getApps();
    
    if (apps.length === 0) {
      // Initialize with service account credentials
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      adminApp = apps[0];
    }
    
    // Initialize Firebase Admin services
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    adminStorage = getStorage(adminApp);
    
    // Log initialization status in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export the initialized services
export {
  adminApp,
  adminDb,
  adminAuth,
  adminStorage
};