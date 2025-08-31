import { MongoClient } from 'mongodb'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME || 'valentino-site'
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'database',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : [];

      if (adminEmails.includes(user.email)) {
        console.log(`Allowed sign-in for: ${user.email}`);
        
        // Handle the case where user was deleted but account/session data still exists
        try {
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB_NAME || 'valentino-site');
          
          // Check if user exists in users collection
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (!existingUser && account?.provider === 'google') {
            // User was deleted but OAuth account still exists - clean up and allow re-creation
            console.log(`Cleaning up orphaned account data for: ${user.email}`);
            
            // Remove orphaned accounts and sessions
            await db.collection('accounts').deleteMany({ 
              $or: [
                { email: user.email },
                { providerAccountId: account.providerAccountId }
              ]
            });
            
            await db.collection('sessions').deleteMany({ 
              userEmail: user.email 
            });
          }
        } catch (error) {
          console.error('Error cleaning up account data:', error);
        }
        
        return true;
      } else {
        console.log(`Blocked unauthorized sign-in attempt from: ${user.email}`);
        return false;
      }
    },
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.email = user.email;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      // When a new user is created, ensure they have the approval fields if they're an admin
      const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : [];
      
      if (adminEmails.includes(user.email)) {
        try {
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB_NAME || 'valentino-site');
          
          await db.collection('users').updateOne(
            { email: user.email },
            { 
              $set: { 
                isApproved: true, 
                canViewPrices: true,
                role: 'admin'
              } 
            }
          );
          
          console.log(`Initialized admin fields for: ${user.email}`);
        } catch (error) {
          console.error('Error initializing admin fields:', error);
        }
      }
    }
  },
  pages: {
    error: '/signin-error',
  },
})
