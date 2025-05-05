'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase/client';
import { getUserProfile } from '@/services/api/users';

// Create auth context
const AuthContext = createContext(null);

/**
 * Auth provider component that manages authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Return early if auth is not initialized (server-side)
    if (!clientAuth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(clientAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          setUser({
            ...firebaseUser,
            profile: userProfile
          });
        } catch (error) {
          console.error("Error getting user profile:", error);
          // Still set the basic user info even if profile fetch fails
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Memoize auth value to avoid unnecessary re-renders
  const authValue = {
    user,
    loading,
    // Adding auth state for convenience
    isAuthenticated: !!user,
    isLoading: loading,
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state from any component
 * @returns {Object} Authentication state and user data
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}