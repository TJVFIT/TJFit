"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Role = "admin" | "coach" | "user" | null;

type AuthState = {
  user: User | null;
  role: Role;
  hasActiveCoachChat: boolean;
  activeCoachId?: string;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  hasActiveCoachChat: false,
  loading: true
});

async function fetchAuthState(): Promise<{
  user: User | null;
  role: Role;
  hasActiveCoachChat: boolean;
  activeCoachId?: string;
}> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  const data = await res.json();
  if (!data.user) return { user: null, role: null, hasActiveCoachChat: false };
  return {
    user: {
      id: data.user.id,
      email: data.user.email
    } as User,
    role: data.role ?? null,
    hasActiveCoachChat: Boolean(data.hasActiveCoachChat),
    activeCoachId: typeof data.activeCoachId === "string" ? data.activeCoachId : undefined
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [hasActiveCoachChat, setHasActiveCoachChat] = useState(false);
  const [activeCoachId, setActiveCoachId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const syncFromServer = async () => {
      const { user: u, role: r, hasActiveCoachChat: hasChat, activeCoachId: coachId } = await fetchAuthState();
      setUser(u);
      setRole(r);
      setHasActiveCoachChat(hasChat);
      setActiveCoachId(coachId);
      setLoading(false);
    };

    syncFromServer();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      () => syncFromServer()
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, hasActiveCoachChat, activeCoachId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}