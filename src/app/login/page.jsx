// src/app/login/page.jsx
import LoginClientView from '@/components/login/LoginClientView';

export const metadata = {
  title: 'Login - Fikipedia',
  description: 'Sign in to create and edit articles on Fikipedia, the Free Fictional Encyclopedia',
}

export default function LoginPage() {
  return <LoginClientView />;
}