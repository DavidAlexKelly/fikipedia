// src/lib/auth/authOptions.js
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb } from "@/lib/firebase/admin";
import { userRepository } from "@/repositories/userRepository";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: FirestoreAdapter(adminDb),
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session
      if (session?.user && user?.id) {
        session.user.id = user.id;
      }
      
      // For Firebase integration
      if (session?.user?.email) {
        try {
          // Try to sync with Firebase Auth
          await userRepository.syncWithFirebaseAuth(session);
        } catch (error) {
          console.error("Error syncing user with Firebase Auth:", error);
          // Don't fail the session callback
        }
      }
      
      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to token if available from sign in
      if (user) {
        token.uid = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};