import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, any>;
type Op = [string, ...any[]];
const h = vi.hoisted(() => ({
  viewer: "10000000-0000-4000-8000-000000000001" as string | null,
  role: "coach", tables: {} as Record<string, Row[]>, error: false,
  queries: [] as Array<{ table: string; ops: Op[] }>, db: {} as { from: (table: string) => any }
}));
vi.mock("@/lib/supabase-server", () => ({ getSupabaseServerClient: () => h.db }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: async () => ({
  auth: { getUser: async () => ({ data: { user: h.viewer ? { id: h.viewer } : null }, error: null }) }
}) }));
vi.mock("@/lib/require-auth", () => ({ requireAuth: async () => h.viewer
  ? { ok: true, user: { id: h.viewer }, supabase: h.db }
  : { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}));
vi.mock("@/lib/require-coach-or-admin", () => ({ requireCoachOrAdmin: async () => ({
  ok: true, userId: h.viewer, role: h.role, supabase: h.db
}) }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => ({ success: true }) }));

import { GET as profile } from "@/app/api/profile/[username]/route";
import { GET as search } from "@/app/api/search/route";
import { GET as discover } from "@/app/api/users/discover/route";
import { GET as reviews, PATCH as review } from "@/app/api/coach/review-requests/route";
import { GET as leaderboard } from "@/app/api/leaderboard/route";
import { GET as followers } from "@/app/api/follow/followers/route";
import { GET as following } from "@/app/api/follow/following/route";

const owner = "20000000-0000-4000-8000-000000000002";
const id = "30000000-0000-4000-8000-000000000003";
const otherCoach = "40000000-0000-4000-8000-000000000004";
const req = (path: string) => new NextRequest(`https://tjfit.example.test/api/${path}`);
const patch = () => new Request("https://tjfit.example.test/api/coach/review-requests", {
  method: "PATCH", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id, status: "reviewed", coachNotes: "Reviewed" })
});
function value(row: Row, key: string) {
  const [column, field] = key.split("->>");
  return field ? String(row[column]?.[field]) : row[column];
}

beforeEach(() => {
  h.viewer = "10000000-0000-4000-8000-000000000001"; h.role = "coach"; h.error = false; h.queries.length = 0;
  h.tables = {
    profiles: [{ id: owner, username: "member", username_normalized: "member", display_name: "Member",
      avatar_url: null, bio: "Private biography", role: "user", is_private: false, is_searchable: true,
      current_streak: 13, privacy_settings: { show_streak: true, show_programs: true, show_posts: true },
      created_at: "2099-01-01" }],
    program_progress: [{ user_id: owner, program_slug: "home-starter", week_number: 2, is_complete: true }],
    user_badges: [{ user_id: owner, badge_key: "milestone", earned_at: "2026-01-01" }],
    coach_review_requests: [{ id, user_id: owner, coach_id: null, status: "pending", coach_notes: "Original" }]
  };
  h.db.from = (table: string) => {
    const ops: Op[] = []; h.queries.push({ table, ops });
    const execute = () => {
      if (h.error) return { data: null, error: { message: "private database failure" } };
      let rows = (h.tables[table] ?? []).filter(row => ops.every(([op, key, expected]) => {
        if (op === "eq") return value(row, key) === expected;
        if (op === "neq") return value(row, key) !== expected;
        if (op === "gte") return value(row, key) >= expected;
        if (op === "in") return expected.includes(value(row, key));
        if (op === "or" && table === "coach_review_requests") {
          const own = String(key).match(/^coach_id\.eq\.([^,]+),/);
          const unassigned = String(key).includes("and(coach_id.is.null,status.eq.pending)");
          return row.coach_id === own?.[1] || (row.status === "pending" && (!unassigned || row.coach_id === null));
        }
        return true;
      }));
      const update = ops.find(([op]) => op === "update");
      if (update) rows.forEach(row => Object.assign(row, update[1]));
      const limit = ops.find(([op]) => op === "limit")?.[1];
      if (limit) rows = rows.slice(0, limit);
      const range = ops.find(([op]) => op === "range");
      if (range) rows = rows.slice(range[1], range[2] + 1);
      return { data: rows, error: null, count: rows.length };
    };
    const query: Record<string, any> = {};
    for (const method of ["select", "eq", "neq", "gte", "in", "range", "or", "ilike", "order", "limit", "update"]) {
      query[method] = (...args: any[]) => { ops.push([method, ...args]); return query; };
    }
    query.maybeSingle = async () => { const result = execute(); return { ...result, data: result.data?.[0] ?? null }; };
    query.then = (resolve: (result: unknown) => unknown) => Promise.resolve(execute()).then(resolve);
    return query;
  };
});

describe("private leaderboards and relationship lists", () => {
  it("never shares a viewer's private leaderboard result through a public cache", async () => {
    h.tables.profiles[0].is_private = true; h.viewer = owner;
    h.tables.leaderboard_weekly_snapshots = [{ user_id: owner, streak_days: 13, blog_views: 4, posts_count: 1, programs_done: 2 }];
    const ownResponse = await leaderboard(req("leaderboard?period=alltime"));
    const own = await ownResponse.json();
    expect(ownResponse.headers.get("Cache-Control")).toBe("private, no-store");
    expect(own.items).toEqual([]); expect(own.me.userId).toBe(owner);
    h.viewer = otherCoach;
    const otherResponse = await leaderboard(req("leaderboard?period=alltime"));
    const other = await otherResponse.json();
    expect(other.items).toEqual([]); expect(other.me).toBeNull();
    expect(otherResponse.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("keeps unsearchable users and hidden metric ranks out, redacts other hidden metrics, and uses public display names", async () => {
    h.viewer = null;
    h.tables.profiles[0].full_name = "Confidential legal name";
    h.tables.profiles[0].privacy_settings = { show_streak: true, show_posts: false, show_programs: false };
    h.tables.profiles.push(
      { ...h.tables.profiles[0], id, is_searchable: false },
      { ...h.tables.profiles[0], id: otherCoach, privacy_settings: { show_streak: false } }
    );
    h.tables.leaderboard_weekly_snapshots = [owner, id, otherCoach].map(user_id => ({ user_id, streak_days: 13, blog_views: 4, posts_count: 1, programs_done: 2 }));
    const body = await (await leaderboard(req("leaderboard?period=alltime"))).json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ userId: owner, rank: 1, displayName: "Member", streak: 13, blogViews: null, postsCount: null, programsDone: null });
    expect(JSON.stringify(body)).not.toContain("Confidential legal name");
  });

  it.each([["followers", followers], ["following", following]] as const)("keeps private %s relationships owner-only", async (direction, handler) => {
    h.tables.profiles[0].is_private = true;
    h.tables.user_follows = [{ follower_id: owner, following_id: otherCoach, created_at: "2026-09-01" },
      { follower_id: otherCoach, following_id: owner, created_at: "2026-09-01" }];
    const url = req(`follow/${direction}?user_id=${owner}`);
    expect((await handler(url)).status).toBe(404);
    expect(h.queries.map(q => q.table)).toEqual(["profiles"]);
    h.viewer = owner;
    const response = await handler(url);
    expect(response.status).toBe(200);
    expect((await response.json()).items[0].id).toBe(otherCoach);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it.each([["followers", followers], ["following", following]] as const)("preserves public %s lists and validates page bounds", async (direction, handler) => {
    expect((await handler(req(`follow/${direction}?user_id=${owner}`))).status).toBe(200);
    expect((await handler(req(`follow/${direction}?user_id=${owner}&page=Infinity`))).status).toBe(400);
  });
});

describe("profile privacy through service-role APIs", () => {
  it.each([null, "10000000-0000-4000-8000-000000000001"])("limits private profiles for viewer %s before reading activity", async viewer => {
    h.viewer = viewer; h.tables.profiles[0].is_private = true;
    const response = await profile(req("profile/member"), { params: Promise.resolve({ username: "member" }) });
    const body = await response.json();
    expect(response.status).toBe(200); expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(body.profile).toMatchObject({ id: owner, bio: "", is_private: true, limited: true });
    expect(body).toMatchObject({ stats: null, badges: [], active_program: null, recent_community_posts: [] });
    expect(JSON.stringify(body)).not.toContain("Private biography");
    expect(h.queries.map(q => q.table)).toEqual(["profiles"]);
  });

  it.each([true, false])("keeps the owner's private=%s profile and activity readable", async isPrivate => {
    h.viewer = owner; h.tables.profiles[0].is_private = isPrivate;
    const response = await profile(req("profile/member"), { params: Promise.resolve({ username: "member" }) });
    const body = await response.json();
    expect(body.profile.bio).toBe("Private biography"); expect(body.profile.self).toBe(true);
    expect(body.active_program.program_slug).toBe("home-starter");
  });

  it("preserves a public identity card and its explicit activity visibility settings", async () => {
    h.viewer = null; h.tables.profiles[0].privacy_settings = { show_streak: false, show_programs: false, show_posts: false };
    const response = await profile(req("profile/member"), { params: Promise.resolve({ username: "member" }) });
    const body = await response.json();
    expect(body.profile.bio).toBe("Private biography");
    expect(body.stats.streak).toBeNull(); expect(body.active_program).toBeNull(); expect(body.recent_blog_posts).toEqual([]);
  });

  it("keeps unsearchable identities out of both global user and coach search", async () => {
    h.tables.profiles.push({ ...h.tables.profiles[0], id, username: "hidden-coach", role: "coach", is_searchable: false });
    const body = await (await search(req("search?q=member"))).json();
    expect(body.results.users.map((row: Row) => row.id)).toEqual([owner]);
    expect(body.results.coaches).toEqual([]);
    expect(h.queries.filter(q => q.table === "profiles").every(q => q.ops.some(op => op[0] === "eq" && op[1] === "is_searchable" && op[2] === true))).toBe(true);
  });

  it("quotes search syntax characters inside the PostgREST value", async () => {
    const input = 'member,role.eq.admin)"\\';
    await search(req("search?q=" + encodeURIComponent(input)));
    const filter = h.queries.find(q => q.table === "profiles")!.ops.find(op => op[0] === "or")![1];
    expect(filter).toMatch(/^display_name\.ilike\."/);
    expect(filter).toContain('member,role.eq.admin)\\"');
    expect(filter).toContain('",username.ilike."');
  });

  it("discovers only opted-in public accounts without reading anyone's saved plan", async () => {
    h.tables.profiles.push(
      { ...h.tables.profiles[0], id, is_private: true },
      { ...h.tables.profiles[0], id: otherCoach, is_searchable: false },
      { ...h.tables.profiles[0], id: "visible-coach", role: "coach", privacy_settings: { show_streak: false } }
    );
    const response = await discover(); const body = await response.json();
    expect(body.similar_goal).toEqual([]);
    expect(body.new_members.map((row: Row) => row.id)).toEqual([owner, "visible-coach"]);
    expect(body.coaches[0].current_streak).toBeNull();
    expect(body.top_earners.map((row: Row) => row.id)).toEqual([owner]);
    expect(h.queries.every(q => q.table === "profiles")).toBe(true);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});

describe("coach review ownership", () => {
  it.each(["pending", "reviewed"])("cannot overwrite another coach's %s request", async status => {
    Object.assign(h.tables.coach_review_requests[0], { coach_id: otherCoach, status });
    expect((await review(patch())).status).toBe(404);
    expect(h.tables.coach_review_requests[0]).toMatchObject({ coach_id: otherCoach, coach_notes: "Original" });
    expect(h.queries).toHaveLength(1); // no ownership read followed by an unguarded write
  });

  it("lists only the coach's requests and pending unassigned requests", async () => {
    h.tables.coach_review_requests.push({ id: "other", coach_id: otherCoach, status: "pending" });
    expect((await (await reviews()).json()).requests.map((row: Row) => row.id)).toEqual([id]);
  });

  it("allows exactly one claim, then rejects a second coach without reassigning it", async () => {
    const firstCoach = h.viewer;
    expect((await review(patch())).status).toBe(200);
    h.viewer = otherCoach;
    expect((await review(patch())).status).toBe(404);
    expect(h.tables.coach_review_requests[0].coach_id).toBe(firstCoach);
    for (const query of h.queries) expect(query.ops).toContainEqual(["or", expect.stringContaining("and(coach_id.is.null,status.eq.pending)")]);
  });

  it("does not let coaches claim an unassigned closed request but preserves administrator access", async () => {
    h.tables.coach_review_requests[0].status = "declined";
    expect((await review(patch())).status).toBe(404);
    h.role = "admin";
    expect((await review(patch())).status).toBe(200);
  });
});
