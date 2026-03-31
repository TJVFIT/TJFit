"use client";

import { useEffect } from "react";
import { trackMarketingEvent } from "@/lib/analytics-events";

export function ProgramViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackMarketingEvent("program_view", { slug, surface: "program-detail" });
  }, [slug]);
  return null;
}
