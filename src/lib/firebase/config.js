// src/lib/firebase/config.js
// Unified Firebase configuration with environment detection

// Firebase configuration shared between client and server
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Determine the current environment
const isClient = typeof window !== 'undefined';
const isServer = !isClient;

// Export all the configuration variables
export {
  firebaseConfig,
  isClient,
  isServer
};