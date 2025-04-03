/* eslint-disable @typescript-eslint/no-explicit-any */
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'
import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'

import Google from 'next-auth/providers/google'

import db from './db/drizzle'
import { users } from './db/schema'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
    signOut: '/sign-out',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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
    jwt: async ({ token, user, trigger, session, account }: any) => {
      if (user) {
        if (account?.provider === 'google') {
          const existingUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, user.email),
          });

          if (existingUser) {
            token.role = existingUser.role;
          } else {
            token.role = 'user';

            const userId = crypto.randomUUID();
            await db.insert(users).values({
              id: userId,
              name: user.name,
              email: user.email,
              emailVerified: new Date(),
              image: user.image,
              role: 'user'
            }).onConflictDoUpdate({
              target: users.email,
              set: {
                name: user.name,
                image: user.image,
                emailVerified: new Date()
              }
            });
          }
        } else {
          token.role = user.role;
        }

        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];
          await db
            .update(users)
            .set({ name: token.name })
            .where(eq(users.id, user.id));
        }
      }

      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
    session: async ({ session, token }: any) => {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    },
    authorized({ request, auth }: any) {
      const protectedPaths = [
        /\/profile/,
        /\/admin/,
      ]
      const { pathname } = request.nextUrl
      return !protectedPaths.some((p) => p.test(pathname)) || !!auth
    },
    signIn: async ({ user, account }: any) => {
      console.log('🔑 Sign in callback triggered:', { user, account });
      return true;
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
