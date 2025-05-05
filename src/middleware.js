
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  console.log('Middleware checking auth for:', req.nextUrl.pathname);
  
  // Get the pathname
  const path = req.nextUrl.pathname;
  
  // Define paths that require authentication
  const authRequiredPaths = [
    '/wiki/*/edit',
    '/create',
    '/profile',
  ];
  
  // Check if the path requires authentication
  const requiresAuth = authRequiredPaths.some(pattern => {
    // Convert glob pattern to regex
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    return regex.test(path);
  });
  
  if (requiresAuth) {
    // Get the token from NextAuth
    const token = await getToken({ 
      req: req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // If no token, redirect to login
    if (!token) {
      console.log('Auth required but no token found, redirecting to login');
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/wiki/:path*/edit',
    '/create',
    '/profile',
  ],
};