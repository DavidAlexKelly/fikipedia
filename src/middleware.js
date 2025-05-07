// src/middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Paths that require authentication
  const protectedPaths = [
    // Article creation and editing
    '/wiki/*/edit',
    '/create',
    '/new-article',
    
    // User account pages
    '/profile',
    '/settings',
    '/dashboard',
    '/watchlist',
    '/contributions',
    
    // Content management
    '/upload',
    '/drafts',
    '/review',
    
    // API routes requiring auth
    '/api/articles/create',
    '/api/articles/*/edit',
    '/api/articles/*/delete',
    '/api/users/me',
    '/api/users/me/*',
    '/api/upload'
  ];
  
  // Public paths that should always be accessible
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/api/auth',
    '/wiki',
    '/search',
    '/changes',
    '/random',
    '/categories',
    '/category',
    '/about',
    '/help',
    '/guidelines',
    '/terms',
    '/privacy',
    '/contact',
    '/_next',
    '/favicon.ico',
    '/images'
  ];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  );
  
  // If path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(protectedPath => {
    if (protectedPath.includes('*')) {
      // Handle wildcards by converting to regex pattern
      const pattern = new RegExp(`^${protectedPath.replace('*', '.*')}$`);
      return pattern.test(path);
    }
    return path === protectedPath || path.startsWith(`${protectedPath}/`);
  });
  
  // If path requires authentication, check for a valid session
  if (isProtectedPath) {
    // Get the authentication token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // If not authenticated, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      // Add the current path as a callback URL after login
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user has a token but lacks required permissions for specific routes,
    // you could add additional checks here
    
    // For example, admin routes could be protected like this:
    /*
    if (path.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    */
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure middleware to run only on specified paths
export const config = {
  matcher: [
    // Include all paths that need authentication checking
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ]
};