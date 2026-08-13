import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { searchBundles } from "@/lib/search-bundles";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { searchNormalize } from "@/lib/turkish-chars";

const QUERY_MAX = 100;

// Escape PostgREST ilike wildcards so a query string can't expand into a
// table scan via `%`. The pattern wraps the user input with %...% itself.
function escapeIlike(value: string): string {
  return value.replace(/([%_])/g, "\\$1");
}

export async function GET(request: NextRequest) {
  const admin = getSupabaseServerClient();
  const qRaw = (request.nextUrl.searchParams.get("q") ?? "").slice(0, QUERY_MAX);
  const q = searchNormalize(qRaw);
  if (q.length < 2) {
    return NextResponse.json({ results: { bundles: [], coaches: [], blog: [], users: [] } });
  }

  // Anonymous endpoint that hits multiple tables per call. Without a rate
  // limit a script can spam the DB at low effort. Per-IP limit is generous
  // for legitimate typeahead use.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const limiter = await rateLimit({
    key: `search:${ip}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const bundleHits = searchBundles(q);

  if (!admin) {
    return NextResponse.json({
      results: { bundles: bundleHits.slice(0, 3), coaches: [], blog: [], users: [] }
    });
  }

  // Push the filter into the DB via ilike — previously the route loaded all
  // 80 profiles + 80 blog rows on every keystroke and filtered in memory.
  // That doesn't scale; ilike pushes the work to Postgres where a trigram
  // or btree index can handle it. The escapeIlike() guards against query
  // strings that contain `%` or `_` (which would otherwise act as wildcards).
  const pattern = `%${escapeIlike(q)}%`;
  const [{ data: coaches }, { data: users }, { data: blog }] = await Promise.all([
    admin
      .from("profiles")
      .select("id,username,display_name,specialty_tags")
      .eq("role", "coach")
      .or(`display_name.ilike.${pattern},username.ilike.${pattern}`)
      .limit(10),
    admin
      .from("profiles")
      .select("id,username,display_name")
      .or(`display_name.ilike.${pattern},username.ilike.${pattern}`)
      .limit(10),
    admin
      .from("community_blog_posts")
      .select("id,title,status")
      .eq("status", "published")
      .ilike("title", pattern)
      .limit(10)
  ]);

  return NextResponse.json({
    results: {
      bundles: bundleHits.slice(0, 3),
      coaches: (coaches ?? [])
        .slice(0, 3)
        .map((row) => ({ id: row.id, title: row.display_name || `@${row.username}`, href: `/coaches/${row.username}` })),
      blog: (blog ?? [])
        .slice(0, 3)
        .map((row) => ({ id: String(row.id), title: String(row.title), href: `/blog/${row.id}` })),
      users: (users ?? [])
        .slice(0, 3)
        .map((row) => ({ id: row.id, title: row.display_name || `@${row.username}`, href: `/profile/${row.username}` }))
    }
  });
}
