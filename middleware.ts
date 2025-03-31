import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/sign-in',
    '/auth/login',
    '/sign-up',
    '/api/auth',
    '/api/check-session',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname.startsWith(path)
  );
  
  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If the user is not logged in, redirect to login
  if (!session?.user) {
    const signInUrl = new URL('/auth/login', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin paths that require specific roles
  const adminPaths = [
    '/dashboard/events',
    '/dashboard/venues',
    '/dashboard/categories',
    '/dashboard/users',
  ];

  const isAdminPath = adminPaths.some(
    (path) => request.nextUrl.pathname.startsWith(path)
  );

  // If the user lacks the required role for admin paths, redirect to unauthorized
  if (isAdminPath && session.user.role !== 'admin' && session.user.role !== 'manager') {
    const unauthorizedUrl = new URL('/unauthorized', request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // If the user is logged in and accessing authentication pages, redirect to home
  if (session?.user && (
    request.nextUrl.pathname.startsWith('/sign-in') || 
    request.nextUrl.pathname.startsWith('/auth/login') || 
    request.nextUrl.pathname.startsWith('/sign-up')
  )) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api/auth, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 