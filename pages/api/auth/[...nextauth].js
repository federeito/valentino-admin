import client from '@/lib/mongodb'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'


export default NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [
    // OAuth authentication providers...
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Get the list of allowed admin emails from environment variables
      // It's crucial that these emails match exactly with the Google accounts you want to allow.
      const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

      // Check if the user's email is in the allowed list
      if (adminEmails.includes(user.email)) {
        console.log(`Allowed sign-in for: ${user.email}`);
        return true; // Allow the sign in
      } else {
        // Log unauthorized attempts for debugging
        console.log(`Blocked unauthorized sign-in attempt from: ${user.email}`);
        // Return false to prevent the user from signing in and redirect them back to the sign-in page
        return false;
      }
    },
    // You might also want a session callback to pass additional user data to the session if needed
    async session({ session, token, user }) {
    //   // If you need the email in the session object on the client side (e.g., for conditional rendering)
    if (user) {
    session.user.email = user.email;
    }
    return session;
    }
  },
  pages: {
    error: '/signin-error',
  },
  })
