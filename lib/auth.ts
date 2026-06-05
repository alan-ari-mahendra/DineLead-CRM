import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email dan Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
          select: { plan: true, status: true },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          subscription: subscription
            ? { plan: subscription.plan, status: subscription.status }
            : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        if ((user as any).subscription) {
          token.subscriptionPlan = (user as any).subscription.plan;
          token.subscriptionStatus = (user as any).subscription.status;
        }
      }

      // Re-fetch subscription on session update (after checkout)
      if (trigger === "update") {
        const subscription = await prisma.subscription.findUnique({
          where: { userId: token.id as string },
          select: { plan: true, status: true },
        });
        if (subscription) {
          token.subscriptionPlan = subscription.plan;
          token.subscriptionStatus = subscription.status;
        } else {
          token.subscriptionPlan = "free";
          token.subscriptionStatus = "active";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        if (token.subscriptionPlan) {
          session.user.subscription = {
            plan: token.subscriptionPlan as string,
            status: (token.subscriptionStatus as string) || "active",
          };
        }
      }
      return session;
    },
  },
};
