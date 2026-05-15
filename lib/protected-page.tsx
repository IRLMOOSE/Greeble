"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

export function ProtectedPage({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="page-container"><p>Loading...</p></div>;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return <>{children}</>;
}
