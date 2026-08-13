"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget view beacon for blog/[slug] (WP-INFRA-07). Renders nothing.
 * The POST replaces the in-render view increment so the page itself can be
 * ISR-cached; the server route rate-limits per (IP, post).
 */
export function BlogViewBeacon({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return;
    void fetch(`/api/blog/posts/${encodeURIComponent(postId)}/view`, {
      method: "POST",
      keepalive: true
    }).catch(() => {
      // View counting is best-effort — never surface a failure to the reader.
    });
  }, [postId]);

  return null;
}
