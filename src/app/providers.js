// src/app/providers.js
'use client';

import { SessionProvider } from "next-auth/react";
import { useMemo } from 'react';
import QueryProvider from '@/lib/react-query/QueryProvider';
import { AuthProvider } from '@/hooks/auth/useAuth';

export function Providers({ children }) {
  const sessionOptions = useMemo(() => ({
    refetchInterval: 0,
    refetchOnWindowFocus: false
  }), []);
  
  return (
    <SessionProvider {...sessionOptions}>
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
    </SessionProvider>
  );
}