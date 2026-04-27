import Link from "next/link";
import { redirect } from "next/navigation";

import { TjaiMemoryClient } from "@/components/tjai/memory-client";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TjaiMemoryPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/ai/memory`)}`);

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">What TJAI knows about you</h1>
            <p className="mt-1 text-sm text-white/60">
              Facts TJAI has remembered from your conversations. Edit or wipe anything.
            </p>
          </div>
          <Link
            href={`/${locale}/ai`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            ← Back to TJAI
          </Link>
        </div>
        <TjaiMemoryClient />
      </div>
    </div>
  );
}
