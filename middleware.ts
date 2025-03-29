import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/api/auth',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname.startsWith(path)
  );

  // If the user is not logged in and the path is not public, redirect to sign in
  if (!session?.user && !isPublicPath) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is logged in and accessing authentication pages, redirect to home
  if (session?.user && (
    request.nextUrl.pathname.startsWith('/sign-in') || 
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
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}; 