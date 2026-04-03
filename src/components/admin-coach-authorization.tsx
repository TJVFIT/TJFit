"use client";

import { useEffect, useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";

type Coach = {
  id: string;
  email: string;
  role: string;
};

export function AdminCoachAuthorization() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCoaches = () => {
    fetch("/api/admin/coaches")
      .then((res) => res.json())
      .then((data) => {
        if (data.coaches) setCoaches(data.coaches);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const authorizeCoach = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/authorize-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to authorize coach");
      setSuccess("Coach authorized. They can now log in with this email and password.");
      setEmail("");
      setPassword("");
      fetchCoaches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-[32px] p-6">
      <p className="text-lg font-semibold text-white">Coach authorization</p>
      <p className="mt-2 text-sm text-zinc-400">
        Enter email and password to create a coach account. They can log in and access the coach dashboard.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void authorizeCoach();
        }}
        className="mt-6 space-y-4"
      >
        <input
          className="input"
          type="email"
          placeholder="Coach email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <AsyncButton
          type="button"
          variant="primary"
          fullWidth
          loading={loading}
          loadingText="Authorizing..."
          className="gradient-button rounded-full px-5 py-3 text-sm font-medium text-white"
          onClick={() => authorizeCoach()}
        >
          Authorize as coach
        </AsyncButton>
      </form>

      <div className="mt-6">
        <p className="text-sm font-medium text-white">
          Authorized coaches ({coaches.length})
        </p>
        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {coaches.length === 0 ? (
            <p className="text-sm text-zinc-500">No coaches yet.</p>
          ) : (
            coaches.map((c) => (
              <div
                key={c.id}
                className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300"
              >
                {c.email}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
