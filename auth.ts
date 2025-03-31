import { DrizzleAdapter } from '@auth/drizzle-adapter'
import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import db from './db/drizzle'
import { users } from './db/schema'

export const config = {
  pages: {
    signIn: '/auth/login',
    signOut: '/sign-out',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      
      try {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, user.email as string),
        });

        if (!existingUser) {
          // Create new user with default role
          await db.insert(users).values({
            id: user.id as string,  
            name: user.name as string,
            email: user.email,
            image: user.image,
            role: 'user',
          });
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, user.email as string),
          });

          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }

      // Handle profile updates
      if (session?.user && trigger === 'update') {
        if (session.user.role) token.role = session.user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ request, auth }) {
      // Protected paths that require authentication
      const protectedPaths = [
        /\/dashboard\/(.*)/,
      ]
      
      // Admin paths that require specific roles
      const adminPaths = [
        /\/dashboard\/events(.*)/,
        /\/dashboard\/venues(.*)/,
        /\/dashboard\/categories(.*)/,
        /\/dashboard\/users(.*)/,
      ]
      
      const { pathname } = request.nextUrl
      
      // Check if path requires authentication
      const requiresAuth = protectedPaths.some((p) => p.test(pathname))
      
      // Check if path requires admin role
      const requiresAdminRole = adminPaths.some((p) => p.test(pathname))
      
      // If admin path, check for admin or manager role
      if (requiresAdminRole) {
        return !!auth?.user && (auth.user.role === 'admin' || auth.user.role === 'manager')
      }
      
      // For other protected paths, just check if authenticated
      return !requiresAuth || !!auth
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

