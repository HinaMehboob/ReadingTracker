import { NextAuthOptions, DefaultUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error || !data.user) {
          throw new Error(error?.message || 'No user found with this email');
        }

        // Explicitly block users who haven't confirmed their email
        if (!data.user.email_confirmed_at) {
          throw new Error('Please confirm your email address before signing in.');
        }

        return { 
          id: data.user.id, 
          email: data.user.email, 
          name: data.user.user_metadata?.name || data.user.email
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // When a user logs in for the first time
      if (user) {
        token.id = user.id;
      }
      // Specifically for Google/OAuth: ensure the 'sub' (subject ID) is captured
      if (account && account.provider === 'google') {
        token.id = token.sub as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // This line ensures session.user.id is NEVER undefined
        session.user.id = token.id || (token.sub as string);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  // Ensure this points exactly to your env variable
  secret: process.env.NEXTAUTH_SECRET,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}