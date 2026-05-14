import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      subscription?: {
        plan: string;
        status: string;
      } | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
  }
}
