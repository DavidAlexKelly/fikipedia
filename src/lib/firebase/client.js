// src/lib/firebase/client.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Initialize Firebase services with null defaults for SSR
let clientApp = null;
let clientAuth = null;
let clientStorage = null;

// Only initialize on client-side
if (typeof window !== 'undefined') {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      clientApp = initializeApp(firebaseConfig);
    } else {
      clientApp = getApps()[0];
    }
    
    // Initialize Firebase services
    clientAuth = getAuth(clientApp);
    clientStorage = getStorage(clientApp);
    
    // Log initialization status in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Firebase client initialized successfully');
    }
  } catch (error) {
    console.error('Firebase client initialization error:', error);
  }
}

// Export the initialized services
export {
  clientApp,
  clientAuth,
  clientStorage
};