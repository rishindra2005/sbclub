
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDB from '@/lib/db';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';

import { AuthOptions, SessionStrategy } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectToDB();

        if (!credentials) {
          return null;
        }

        const user = await User.findOne({ email: credentials.email });

        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user._id.toString(), name: user.name, email: user.email };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
