// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

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
      
      // For full Firebase Admin integration, we would synchronize the user
      // with Firebase Auth here, but simplified for better design
      if (session?.user?.email) {
        try {
          // Try to get or create the user in Firebase Auth if needed
          // This is now a server-side operation
          let firebaseUser = null;
          try {
            firebaseUser = await adminAuth.getUserByEmail(session.user.email);
          } catch (error) {
            if (error.code === 'auth/user-not-found') {
              // Create the user in Firebase Auth
              firebaseUser = await adminAuth.createUser({
                email: session.user.email,
                displayName: session.user.name,
                photoURL: session.user.image,
                emailVerified: true,
              });
              
              // Initialize user data in Firestore (if not already handled by adapter)
              const userProfileRef = adminDb.collection('userProfiles').doc(firebaseUser.uid);
              await userProfileRef.set({
                email: session.user.email,
                displayName: session.user.name,
                photoURL: session.user.image,
                createdAt: new Date(),
                lastLogin: new Date(),
                settings: {
                  emailNotifications: true,
                  theme: 'light',
                  watchlist: []
                }
              }, { merge: true });
            } else {
              throw error;
            }
          }
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };