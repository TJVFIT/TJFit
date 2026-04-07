import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import { URL_NOTICE } from "@/lib/url-notice";

const LOCALES = new Set(["en", "tr", "ar", "es", "fr"]);

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

type GuardKind = "admin" | "coach_area" | "upload" | "auth_user" | "coach_terms";

function matchHtmlGuard(pathname: string): { locale: string; kind: GuardKind } | null {
  if (pathname.startsWith("/api")) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const locale = segments[0];
  if (!LOCALES.has(locale)) return null;
  const sub = `/${segments.slice(1).join("/")}`;
  if (sub === "/admin" || sub.startsWith("/admin/")) return { locale, kind: "admin" };
  if (sub === "/coach/terms") return { locale, kind: "coach_terms" };
  if (sub === "/coach-dashboard" || sub.startsWith("/coach-dashboard/")) return { locale, kind: "coach_area" };
  if (sub === "/programs/upload" || sub.startsWith("/programs/upload/")) return { locale, kind: "upload" };
  if (sub === "/dashboard" || sub.startsWith("/dashboard/")) return { locale, kind: "auth_user" };
  if (sub === "/messages" || sub.startsWith("/messages/")) return { locale, kind: "auth_user" };
  if (sub === "/feed" || sub.startsWith("/feed/")) return { locale, kind: "auth_user" };
  if (sub === "/profile/edit" || sub.startsWith("/profile/edit/")) return { locale, kind: "auth_user" };
  if (sub === "/settings/profile" || sub.startsWith("/settings/profile/")) return { locale, kind: "auth_user" };
  if (sub === "/checkout" || sub.startsWith("/checkout/")) return { locale, kind: "auth_user" };
  if (sub === "/purchase" || sub.startsWith("/purchase/")) return { locale, kind: "auth_user" };
  if (sub === "/payment" || sub.startsWith("/payment/")) return { locale, kind: "auth_user" };
  if (sub === "/progress" || sub.startsWith("/progress/")) return { locale, kind: "auth_user" };
  if (sub === "/settings" || sub.startsWith("/settings/")) return { locale, kind: "auth_user" };
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

    if (!user.email_confirmed_at && path !== `/${locale}/verify-email`) {
      const verify = new URL(`/${locale}/verify-email`, request.url);
      verify.searchParams.set("redirect", path);
      const redirectRes = NextResponse.redirect(verify);
      copyCookies(response, redirectRes);
      applyHtmlCacheHeaders(request, redirectRes);
      return redirectRes;
    }

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

    if (kind === "coach_area" || kind === "upload") {
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
