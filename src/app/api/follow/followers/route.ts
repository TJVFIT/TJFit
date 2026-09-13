import { NextRequest } from "next/server";
import { readFollowList } from "@/lib/follow-list";
export async function GET(request: NextRequest) {
  return readFollowList(request, "followers");
}
