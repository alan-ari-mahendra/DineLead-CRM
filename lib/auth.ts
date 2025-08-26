import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        return valid ? user : null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
};
