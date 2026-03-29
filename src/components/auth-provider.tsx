"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Role = "admin" | "coach" | "user" | null;

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

async function fetchAuthState(): Promise<{ user: User | null; role: Role }> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  const data = await res.json();
  if (!data.user) return { user: null, role: null };
  return {
    user: {
      id: data.user.id,
      email: data.user.email
    } as User,
    role: data.role ?? null
  };
}

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

    const syncFromServer = async () => {
      const { user: u, role: r } = await fetchAuthState();
      setUser(u);
      setRole(r);
      setLoading(false);
    };

    syncFromServer();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      () => syncFromServer()
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