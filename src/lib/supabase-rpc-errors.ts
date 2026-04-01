import { NextResponse } from "next/server";
import { logServerWarning } from "@/lib/server-log";

/**
 * Detects errors that usually mean migrations/RPCs are missing on the linked database.
 */
export function isMissingSchemaMigrationError(message: string | undefined | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("does not exist") ||
    m.includes("schema cache") ||
    m.includes("could not find the function")
  );
}

export function jsonSchemaNotReady(logContext: string, rawMessage?: string | null) {
  if (rawMessage) {
    logServerWarning(logContext, rawMessage.slice(0, 500));
  }
  return NextResponse.json(
    {
      error:
        "This feature needs the latest database update. If the problem continues, contact support.",
      code: "DATABASE_SCHEMA_NOT_READY"
    },
    { status: 503 }
  );
}
