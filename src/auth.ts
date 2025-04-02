import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
  
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id: string;
//     role: string;
//   }
// }

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      
      return session;
    },
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Allow updating user data in session
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.picture = session.image;
      }
      
      return token;
    },
  },
}); 