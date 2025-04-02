import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/signin',
    verifyRequest: '/verify-request',
    newUser: '/signup',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Public routes that don't require authentication
      const publicRoutes = [
        '/',
        '/events',
        '/signin',
        '/signup',
        '/api/webhook',
      ];
      
      // Check if the current URL path starts with any of the public routes
      const isPublicRoute = publicRoutes.some(route => 
        nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
      );
      
      // Admin routes - only accessible for ADMIN role
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isAdmin = auth?.user?.role === 'ADMIN';
      
      // Manager routes - only accessible for MANAGER or ADMIN role
      const isManagerRoute = nextUrl.pathname.startsWith('/manager');
      const isManager = auth?.user?.role === 'MANAGER' || isAdmin;
      
      // User account routes - require authentication
      const isAccountRoute = nextUrl.pathname.startsWith('/account');
      
      // Allow access to admin/manager dashboards if the user has proper role
      if (isAdminRoute) return isAdmin;
      if (isManagerRoute) return isManager;
      
      // Allow access to user account page only for authenticated users
      if (isAccountRoute) return isLoggedIn;
      
      // Allow public routes
      if (isPublicRoute) return true;
      
      // Deny access to other protected routes for unauthenticated users
      if (!isLoggedIn) {
        return false;
      }
      
      // Allow authenticated users to access all other routes
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // Add credentials provider logic here
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // This is where you would typically validate against your database
          // For now, let's use a simplified approach for development
          if (email === 'admin@example.com' && password === 'password') {
            return {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'ADMIN',
            };
          } else if (email === 'manager@example.com' && password === 'password') {
            return {
              id: '2',
              name: 'Manager User',
              email: 'manager@example.com',
              role: 'MANAGER',
            };
          } else if (email === 'user@example.com' && password === 'password') {
            return {
              id: '3',
              name: 'Regular User',
              email: 'user@example.com',
              role: 'USER',
            };
          }
        }
        
        return null;
      },
    }),
  ],
}; 