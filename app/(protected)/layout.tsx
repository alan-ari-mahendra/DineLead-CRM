import { AuthProvider } from "@/contexts/AuthContext";
import type React from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthProvider>{children}</AuthProvider>
    </>
  );
}
