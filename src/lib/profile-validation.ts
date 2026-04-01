import { isValidUsername, normalizeUsername } from "@/lib/username";

export const MESSAGE_PRIVACY_VALUES = [
  "everyone",
  "nobody",
  "coaches_only",
  "connections_only",
  "approved_only"
] as const;

export type MessagePrivacy = (typeof MESSAGE_PRIVACY_VALUES)[number];

const MAX_DISPLAY_NAME = 80;
const MAX_BIO = 500;
const MAX_AVATAR_URL = 2048;

export function normalizeMessagePrivacyInput(raw: string | undefined): MessagePrivacy | null {
  if (!raw || typeof raw !== "string") return null;
  if (raw === "staff_only") return "coaches_only";
  if ((MESSAGE_PRIVACY_VALUES as readonly string[]).includes(raw)) {
    return raw as MessagePrivacy;
  }
  return null;
}

export function sanitizeDisplayName(raw: string): string {
  return raw.trim().slice(0, MAX_DISPLAY_NAME);
}

export function sanitizeBio(raw: string): string {
  return raw.trim().slice(0, MAX_BIO);
}

/** Returns null for empty; rejects non-http(s) URLs. */
export function sanitizeAvatarUrl(raw: string): string | null {
  const t = raw.trim().slice(0, MAX_AVATAR_URL);
  if (!t) return null;
  try {
    const url = new URL(t);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return t;
  } catch {
    return null;
  }
}

export type ProfilePatchInput = {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  is_private?: boolean;
  is_searchable?: boolean;
  message_privacy?: string;
  searchable?: boolean;
};

export type ProfilePatchResult =
  | { ok: true; patch: Record<string, unknown> }
  | { ok: false; status: number; error: string };

/**
 * Validates PATCH body for /api/profiles/me. Only includes keys present and valid.
 */
export function buildProfilePatch(body: unknown): ProfilePatchResult {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }

  const o = body as ProfilePatchInput;
  const patch: Record<string, unknown> = {};

  if (typeof o.username === "string") {
    const u = o.username.trim();
    if (!isValidUsername(u)) {
      return {
        ok: false,
        status: 400,
        error: "Username must be 3–20 characters (letters, numbers, _, .) and not reserved."
      };
    }
    patch.username = u;
  }

  if (typeof o.display_name === "string") {
    patch.display_name = sanitizeDisplayName(o.display_name);
  }

  if (typeof o.avatar_url === "string") {
    const url = sanitizeAvatarUrl(o.avatar_url);
    if (o.avatar_url.trim() !== "" && url === null) {
      return { ok: false, status: 400, error: "Avatar URL must be a valid http(s) URL." };
    }
    patch.avatar_url = url;
  }

  if (typeof o.bio === "string") {
    patch.bio = sanitizeBio(o.bio);
  }

  if (typeof o.is_private === "boolean") {
    patch.is_private = o.is_private;
  }

  if (typeof o.is_searchable === "boolean") {
    patch.is_searchable = o.is_searchable;
  } else if (typeof o.searchable === "boolean") {
    patch.is_searchable = o.searchable;
  }

  if (typeof o.message_privacy === "string") {
    const mp = normalizeMessagePrivacyInput(o.message_privacy);
    if (!mp) {
      return { ok: false, status: 400, error: "Invalid message_privacy value." };
    }
    patch.message_privacy = mp;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, status: 400, error: "No valid fields to update." };
  }

  return { ok: true, patch };
}

export function mapProfileUpdateError(message: string): { status: number; error: string } | null {
  const m = message.toLowerCase();
  if (m.includes("duplicate") || m.includes("unique") || m.includes("23505")) {
    return { status: 409, error: "That username is already taken." };
  }
  if (m.includes("reserved_username") || m.includes("invalid_username") || m.includes("username_required")) {
    return { status: 400, error: "Invalid or reserved username." };
  }
  if (m.includes("profiles_username_format_check") || m.includes("profiles_username_normalized_match")) {
    return { status: 400, error: "Username format is invalid." };
  }
  return null;
}
