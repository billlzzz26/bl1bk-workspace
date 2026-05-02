import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../db/prisma.js";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "google",
      name: "Google",
      type: "oauth",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    },
    {
      id: "github", 
      name: "GitHub",
      type: "oauth",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      }
    }
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export const getServerSession = async (req, res) => {
  // This would be implemented with the actual auth library
  // For now, return a mock session for development
  return {
    user: {
      id: "dev-user-1",
      email: "dev@example.com",
      name: "Developer User",
      image: null
    }
  };
};

export const requireAuth = (handler) => {
  return async (req, res) => {
    const session = await getServerSession(req, res);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = session.user;
    return handler(req, res);
  };
};
