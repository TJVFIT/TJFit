"use client";

import { useMemo, useState } from "react";

import { AsyncButton } from "@/components/ui/AsyncButton";

type Props = {
  targetUserId: string;
  initialFollowing: boolean;
  initialCount: number;
  onCountChange?: (count: number) => void;
};

export function FollowButton({ targetUserId, initialFollowing, initialCount, onCountChange }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [hovering, setHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = useMemo(() => {
    if (!following) return "Follow";
    return hovering ? "Unfollow" : "Following";
  }, [following, hovering]);

  const toggle = async () => {
    setError(null);
    const next = !following;
    const optimistic = next ? count + 1 : Math.max(0, count - 1);
    setFollowing(next);
    setCount(optimistic);
    onCountChange?.(optimistic);

    const res = await fetch("/api/follow", {
      method: next ? "POST" : "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_user_id: targetUserId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFollowing(!next);
      setCount(count);
      onCountChange?.(count);
      setError(String(data.error ?? "Failed"));
      return;
    }
    const serverCount = Number(data.follower_count ?? optimistic);
    setCount(serverCount);
    onCountChange?.(serverCount);
  };

  return (
    <div onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <AsyncButton
        type="button"
        onClick={toggle}
        className={
          following
            ? `rounded-full px-5 py-2 text-sm font-semibold ${hovering ? "border border-red-400/35 bg-red-500/10 text-red-200" : "border border-cyan-400/35 bg-cyan-500/15 text-cyan-100"}`
            : "rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-semibold text-white"
        }
      >
        {label}
      </AsyncButton>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
