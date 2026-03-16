"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Role = "admin" | "coach" | null;

type AuthState = {
  user: User | null;
  role: Role;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const resolveRole = async (u: User | null): Promise<Role> => {
      if (!u?.email) return null;

      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "josephazzs@tjfit.org")
        .toLowerCase()
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      if (adminEmails.includes(u.email.toLowerCase())) return "admin";

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .single();
      if (data?.role === "coach") return "coach";
      if (data?.role === "admin") return "admin";

      return null;
    };

    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      setRole(await resolveRole(u ?? null));
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setRole(await resolveRole(u));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}