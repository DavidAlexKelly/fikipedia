// src/app/login/page.jsx
'use client';

import { Suspense } from 'react';
import LoginView from '@/views/auth/LoginView';
import Loading from '@/components/common/Loading';

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading message="Loading..." />}>
      <LoginView />
    </Suspense>
  );
}