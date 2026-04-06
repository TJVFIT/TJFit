import { NextRequest, NextResponse } from "next/server";

import { callClaude } from "@/lib/tjai-anthropic";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { topic?: string; keyword?: string } | null;
  const topic = String(body?.topic ?? "").trim();
  const keyword = String(body?.keyword ?? "").trim();
  if (!topic || !keyword) return NextResponse.json({ error: "topic and keyword required" }, { status: 400 });

  const system = "You are TJFit's content writer. Write SEO-optimized fitness articles that are accurate, helpful, and engaging.";
  const user = `Write a comprehensive blog post about: ${topic}
Target keyword: ${keyword}
Include: introduction, 5-7 subheadings with content, practical tips, conclusion, meta description.
Tone: expert but accessible. Length: ~1200 words.`;

  const content = await callClaude({ system, user, maxTokens: 4500 });
  return NextResponse.json({ content });
}

