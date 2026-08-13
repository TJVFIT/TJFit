import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import { locales as ROUTING_LOCALES } from "@/lib/i18n";
import { MIDDLEWARE_GUARDS, type GuardKind } from "@/lib/route-guards";
import { URL_NOTICE } from "@/lib/url-notice";

// Sourced from @/lib/i18n so adding a new routing locale doesn't silently
// break launch-gate bypass or HTML auth guards in the middleware.
const LOCALES = new Set<string>(ROUTING_LOCALES);

const LAUNCH_GATE_BYPASS_SEGMENTS = new Set([
  "login",
  "signup",
  "forgot-password",
  "verify-email"
]);

function isLaunchGateActive(): boolean {
  return (process.env.LAUNCH_GATE ?? "").toLowerCase() === "coming-soon";
}

function isLaunchGateBypass(pathname: string): boolean {
  if (pathname === "/coming-soon" || pathname.startsWith("/coming-soon/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length >= 2 &&
    LOCALES.has(segments[0]) &&
    LAUNCH_GATE_BYPASS_SEGMENTS.has(segments[1])
  ) {
    return true;
  }
  return false;
}

function applyHtmlCacheHeaders(request: NextRequest, response: NextResponse) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

async function resolveMiddlewareRole(
  supabase: ReturnType<typeof createServerClient>,
  user: User
): Promise<"admin" | "coach" | "user"> {
  if (user.email && isAdminEmail(user.email)) return "admin";
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role === "admin") return "admin";
  if (data?.role === "coach") return "coach";
  return "user";
}

async function coachHasCurrentTerms(
  supabase: ReturnType<typeof createServerClient>,
  coachId: string
): Promise<boolean> {
  const expected = getCoachTermsVersion();
  const { data } = await supabase
    .from("coach_terms_acceptance")
    .select("terms_version")
    .eq("coach_id", coachId)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.terms_version === expected;
}

function matchHtmlGuard(pathname: string): { locale: string; kind: GuardKind } | null {
  if (pathname.startsWith("/api")) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const locale = segments[0];
  if (!LOCALES.has(locale)) return null;
  const sub = `/${segments.slice(1).join("/")}`;
  // Guard families come from the shared SSOT so robots.ts can never drift
  // from what the middleware actually protects (WP-SEC-05).
  for (const g of MIDDLEWARE_GUARDS) {
    if (sub === g.prefix || (!g.exact && sub.startsWith(`${g.prefix}/`))) {
      return { locale, kind: g.kind };
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers }
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    applyHtmlCacheHeaders(request, response);
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isLaunchGateActive() && !isLaunchGateBypass(request.nextUrl.pathname)) {
    const isAdmin = Boolean(user?.email && isAdminEmail(user.email));
    if (!isAdmin) {
      const target = new URL("/coming-soon", request.url);
      const redirectRes = NextResponse.redirect(target);
      copyCookies(response, redirectRes);
      applyHtmlCacheHeaders(request, redirectRes);
      return redirectRes;
    }
  }

  const guard = matchHtmlGuard(request.nextUrl.pathname);
  if (guard) {
    const { locale, kind } = guard;
    const path = request.nextUrl.pathname;

    if (!user) {
      const login = new URL(`/${locale}/login`, request.url);
      login.searchParams.set("redirect", path);
      const redirectRes = NextResponse.redirect(login);
      copyCookies(response, redirectRes);
      applyHtmlCacheHeaders(request, redirectRes);
      return redirectRes;
    }

    // Email verification gate removed (owner directive): authenticated users
    // get full access without confirming their email first.

    const role = await resolveMiddlewareRole(supabase, user);

    if (kind === "auth_user") {
      applyHtmlCacheHeaders(request, response);
      return response;
    }

    if (kind === "coach_terms") {
      if (role !== "coach") {
        const redirectRes = NextResponse.redirect(
          new URL(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_COACH}`, request.url)
        );
        copyCookies(response, redirectRes);
        applyHtmlCacheHeaders(request, redirectRes);
        return redirectRes;
      }
      applyHtmlCacheHeaders(request, response);
      return response;
    }

    if (kind === "admin") {
      if (role === "coach") {
        const redirectRes = NextResponse.redirect(
          new URL(`/${locale}/coach-dashboard?notice=${URL_NOTICE.FORBIDDEN_ADMIN}`, request.url)
        );
        copyCookies(response, redirectRes);
        applyHtmlCacheHeaders(request, redirectRes);
        return redirectRes;
      }
      if (role !== "admin") {
        const redirectRes = NextResponse.redirect(
          new URL(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_ADMIN}`, request.url)
        );
        copyCookies(response, redirectRes);
        applyHtmlCacheHeaders(request, redirectRes);
        return redirectRes;
      }
    }

    if (kind === "coach_area") {
      if (role !== "coach" && role !== "admin") {
        const redirectRes = NextResponse.redirect(
          new URL(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_COACH}`, request.url)
        );
        copyCookies(response, redirectRes);
        applyHtmlCacheHeaders(request, redirectRes);
        return redirectRes;
      }
      if (role === "coach") {
        const ok = await coachHasCurrentTerms(supabase, user.id);
        if (!ok) {
          const nextParam = encodeURIComponent(path);
          const redirectRes = NextResponse.redirect(
            new URL(`/${locale}/coach/terms?next=${nextParam}`, request.url)
          );
          copyCookies(response, redirectRes);
          applyHtmlCacheHeaders(request, redirectRes);
          return redirectRes;
        }
      }
    }
  }

  applyHtmlCacheHeaders(request, response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
