import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { type NextAuthOptions, getServerSession, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type AppToken = JWT & {
  id?: string;
  username?: string | null;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        identifier: { label: "Email ou usuario", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier?.trim().toLowerCase();
        const password = credentials?.password;

        if (!identifier || !password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      const appToken = token as AppToken;
      if (user?.id) {
        appToken.id = user.id;
        appToken.username = (user as { username?: string | null }).username ?? appToken.username ?? null;
      }
      return appToken;
    },
    session: async ({ session, token }) => {
      const appToken = token as AppToken;
      if (!session.user) {
        return session;
      }

      session.user.id = String(appToken.id ?? "");

      if (!appToken.id) {
        return session;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: appToken.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.name = dbUser.name;
        session.user.email = dbUser.email;
        session.user.image = dbUser.image;
        session.user.username = dbUser.username;
        appToken.username = dbUser.username;
      }

      return session;
    },
  },
};

export type AuthenticatedSession = Session & {
  user: {
    id: string;
    username?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session as AuthenticatedSession;
}
