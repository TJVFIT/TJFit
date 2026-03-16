"use client";

import { useEffect, useState } from "react";

export function LiveProof({ notifications }: { notifications: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (notifications.length === 0) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % notifications.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [notifications.length]);

  if (notifications.length === 0) {
    return (
      <div className="glass-panel rounded-[24px] px-4 py-3 text-sm text-zinc-500">
        <span className="mr-3 inline-block h-2 w-2 rounded-full bg-zinc-500" />
        No activity yet.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[24px] px-4 py-3 text-sm text-zinc-200">
      <span className="mr-3 inline-block h-2 w-2 rounded-full bg-success" />
      {notifications[index]}
    </div>
  );
}
