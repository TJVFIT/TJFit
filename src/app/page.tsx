import { permanentRedirect } from "next/navigation";

/** Fallback if next.config redirect is skipped; uses 308 + Location (crawler-safe). */
export default function RootPage() {
  permanentRedirect("/en");
}
