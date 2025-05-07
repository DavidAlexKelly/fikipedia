// src/hooks/auth/useAuth.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When session status is finalized, we can stop loading
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  const authValue = {
    user: session?.user || null,
    loading: status === 'loading' || loading,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || loading,
    session
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}