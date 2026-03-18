import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME || 'valentino-site'
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
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
        try {
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB_NAME || 'valentino-site');
          
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (!existingUser && account?.provider === 'google') {
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
        return false;
      }
    },
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.email = user.email;
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
        session.user.isAdmin = adminEmails.includes(session.user.email);
        session.user.isApproved = user.isApproved || false;
        session.user.canViewPrices = user.canViewPrices || false;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
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
        } catch (error) {
          console.error('Error initializing admin fields:', error);
        }
      }
    }
  },
  pages: {
    error: '/signin-error',
  },
};
