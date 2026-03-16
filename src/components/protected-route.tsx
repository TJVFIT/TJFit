"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

type Props = {
  children: React.ReactNode;
  locale: string;
  requireAdmin?: boolean;
};

export function ProtectedRoute({ children, locale, requireAdmin }: Props) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (requireAdmin && role !== "admin") {
      router.replace(`/${locale}`);
      return;
    }
  }, [user, role, loading, locale, requireAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }
  if (!user || (requireAdmin && role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}