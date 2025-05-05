import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

// Cache mechanism to store created user information during session
// Note: In production you might want to use a proper caching mechanism like Redis
const sessionCache = new Map();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: FirestoreAdapter(adminDb),
  callbacks: {
    session: async ({ session, user, token }) => {
      // Get user ID from either user object or token
      if (session?.user) {
        // Add user ID to session - safely handle user or token source
        if (user) {
          session.user.id = user.id;
        } else if (token?.sub) {
          session.user.id = token.sub;
        } else if (token?.uid) {
          session.user.id = token.uid;
        }

        // Skip Firebase sync if we don't have an email
        if (!session.user.email) {
          return session;
        }
        
        // Exit early if we already processed this user in this instance
        const cacheKey = `firebaseAuth_${session.user.email}`;
        if (sessionCache.has(cacheKey)) {
          return session;
        }
        
        try {
          // Check if user exists in Firebase Auth
          let firebaseUser = null;
          
          try {
            // Try to find the user in Firebase Auth
            firebaseUser = await adminAuth.getUserByEmail(session.user.email);
            
            // Check if user data needs to be updated
            const needsUpdate = 
              firebaseUser.displayName !== session.user.name || 
              firebaseUser.photoURL !== session.user.image;
            
            if (needsUpdate) {
              // Update user data if needed
              await adminAuth.updateUser(firebaseUser.uid, {
                displayName: session.user.name,
                photoURL: session.user.image,
              });
              console.log(`Updated Firebase Auth user: ${firebaseUser.uid}`);
            }
          } catch (userError) {
            // If user not found, create a new one
            if (userError.code === 'auth/user-not-found') {
              // Create batch operations
              const batch = adminDb.batch();
              
              // Create Firebase Auth user
              firebaseUser = await adminAuth.createUser({
                email: session.user.email,
                displayName: session.user.name,
                photoURL: session.user.image,
                emailVerified: true, // Since they've authenticated via OAuth
              });
              
              // Create additional user data
              const userProfileRef = adminDb.collection('userProfiles').doc(firebaseUser.uid);
              batch.set(userProfileRef, {
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
              });
              
              // Set default user role
              const userRoleRef = adminDb.collection('userRoles').doc(firebaseUser.uid);
              batch.set(userRoleRef, {
                role: 'user',
                permissions: ['read', 'write', 'comment'],
                createdAt: new Date()
              });
              
              // Commit batch operations
              await batch.commit();
              
              // Set custom claims for role-based authorization
              await adminAuth.setCustomUserClaims(firebaseUser.uid, {
                role: 'user',
                createdAt: Date.now()
              });
              
              console.log(`Created Firebase Auth user with batch operations: ${firebaseUser.uid}`);
            } else {
              // Re-throw if it's not a 'user not found' error
              throw userError;
            }
          }
          
          // Cache the user to prevent redundant operations in the same session
          sessionCache.set(cacheKey, {
            uid: firebaseUser?.uid,
            timestamp: Date.now()
          });
          
          // Clean old cache items periodically (items older than 1 hour)
          const now = Date.now();
          for (const [key, value] of sessionCache.entries()) {
            if (now - value.timestamp > 3600000) { // 1 hour
              sessionCache.delete(key);
            }
          }
          
        } catch (error) {
          console.error("Error syncing user with Firebase Auth:", error);
          // Don't fail the session callback, just log the error
        }
      }
      return session;
    },
    jwt: async ({ token, user, account }) => {
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