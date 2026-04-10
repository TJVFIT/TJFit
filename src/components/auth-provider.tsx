"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Role = "admin" | "coach" | "user" | null;

export type AuthProfileSnippet = {
  username?: string;
  display_name?: string;
  avatar_url?: string;
};

type AuthState = {
  user: User | null;
  role: Role;
  hasActiveCoachChat: boolean;
  activeCoachId?: string;
  profile?: AuthProfileSnippet;
  loading: boolean;
  /** True when /api/auth/me failed (network, 5xx, invalid JSON) — not used for logged-out 200. */
  sessionCheckFailed: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  hasActiveCoachChat: false,
  loading: true,
  sessionCheckFailed: false
});

const emptyAuth = {
  user: null,
  role: null as Role,
  hasActiveCoachChat: false,
  activeCoachId: undefined as string | undefined,
  profile: undefined as AuthProfileSnippet | undefined
};

async function fetchAuthState(): Promise<{
  user: User | null;
  role: Role;
  hasActiveCoachChat: boolean;
  activeCoachId?: string;
  profile?: AuthProfileSnippet;
  sessionCheckFailed: boolean;
}> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      console.error("[auth] /api/auth/me HTTP error", res.status);
      return { ...emptyAuth, sessionCheckFailed: true };
    }
    const data = (await res.json().catch((e) => {
      console.error("[auth] /api/auth/me invalid JSON", e);
      return null;
    })) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") {
      return { ...emptyAuth, sessionCheckFailed: true };
    }
    if (!data.user) {
      return { ...emptyAuth, sessionCheckFailed: false };
    }
    const u = data.user as { id?: unknown; email?: unknown };
    if (typeof u.id !== "string") {
      return { ...emptyAuth, sessionCheckFailed: true };
    }
    const p = data.profile;
    const prof =
      p && typeof p === "object"
        ? {
            username: typeof (p as Record<string, unknown>).username === "string" ? String((p as Record<string, unknown>).username) : undefined,
            display_name:
              typeof (p as Record<string, unknown>).display_name === "string"
                ? String((p as Record<string, unknown>).display_name)
                : undefined,
            avatar_url:
              typeof (p as Record<string, unknown>).avatar_url === "string"
                ? String((p as Record<string, unknown>).avatar_url)
                : undefined
          }
        : undefined;
    return {
      user: {
        id: u.id,
        email: typeof u.email === "string" ? u.email : undefined
      } as User,
      role: (data.role as Role) ?? null,
      hasActiveCoachChat: Boolean(data.hasActiveCoachChat),
      activeCoachId: typeof data.activeCoachId === "string" ? data.activeCoachId : undefined,
      profile: prof,
      sessionCheckFailed: false
    };
  } catch (e) {
    console.error("[auth] /api/auth/me fetch failed", e);
    return { ...emptyAuth, sessionCheckFailed: true };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [hasActiveCoachChat, setHasActiveCoachChat] = useState(false);
  const [activeCoachId, setActiveCoachId] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<AuthProfileSnippet | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      setSessionCheckFailed(false);
      return;
    }

    const syncFromServer = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const result = await fetchAuthState();
        setUser(result.user);
        setRole(result.role);
        setHasActiveCoachChat(result.hasActiveCoachChat);
        setActiveCoachId(result.activeCoachId);
        setProfile(result.profile);
        setSessionCheckFailed(result.sessionCheckFailed);
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    };

    // Debounced version for auth state changes — prevents triple-firing
    const debouncedSync = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void syncFromServer(), 150);
    };

    void syncFromServer();

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(() => {
        debouncedSync();
      });
      subscription = data.subscription;
    } catch (e) {
      console.error("[auth] onAuthStateChange subscription failed", e);
      subscription = null;
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, hasActiveCoachChat, activeCoachId, profile, loading, sessionCheckFailed }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
