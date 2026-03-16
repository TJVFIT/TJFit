"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isLocale } from "@/lib/i18n";

function getAdminEmailForUsername(username: string): string | null {
  const raw = process.env.NEXT_PUBLIC_ADMIN_CREDENTIALS ?? "";
  const pairs = raw.split(",").map((p) => p.trim()).filter(Boolean);
  for (const pair of pairs) {
    const [u, e] = pair.split(":").map((s) => s.trim());
    if (u && e && u.toLowerCase() === username.toLowerCase()) return e;
  }
  return null;
}

export default function LoginPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const router = useRouter();

  if (!isLocale(params.locale)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Auth not configured.");
      setLoading(false);
      return;
    }
    const signInEmail = adminMode ? getAdminEmailForUsername(username) : email;
    if (adminMode && !signInEmail) {
      setError("Invalid admin username.");
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email: signInEmail!,
      password
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Login failed.");
      return;
    }
    router.push(`/${params.locale}`);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8">
        <span className="badge">{adminMode ? "Admin Login" : "Login"}</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">
          {adminMode ? "Log in as admin" : "Welcome back."}
        </h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          {adminMode
            ? "Sign in with your admin username and password."
            : "Sign in to access your dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {adminMode ? (
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          ) : (
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : adminMode ? "Log in as admin" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {adminMode ? (
            <button
              type="button"
              onClick={() => {
                setAdminMode(false);
                setError(null);
              }}
              className="text-white underline underline-offset-4 hover:text-zinc-200"
            >
              Use email login instead
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdminMode(true);
                setError(null);
              }}
              className="text-white underline underline-offset-4 hover:text-zinc-200"
            >
              Log in as admin
            </button>
          )}
        </p>
      </div>
    </div>
  );
}