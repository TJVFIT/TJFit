/**
 * Maps Postgres / Supabase errors raised by messaging RLS and triggers
 * (see migration 20260331220000_messaging_enforcement_and_realtime.sql).
 */

export type MessagingErrorPayload = {
  status: number;
  code: string;
  error: string;
};

function includesCode(message: string, code: string) {
  return message.includes(code);
}

export function mapSupabaseMessagingError(message: string): MessagingErrorPayload | null {
  if (!message) return null;
  const m = message;

  if (includesCode(m, "MESSAGING_REQUIRES_APPROVAL")) {
    return {
      status: 403,
      code: "MESSAGING_REQUIRES_APPROVAL",
      error:
        "This member only accepts messages from people they have approved. Approvals are not available in the app yet, so you cannot start a conversation with them."
    };
  }
  if (includesCode(m, "MESSAGING_COACHES_ONLY")) {
    return {
      status: 403,
      code: "MESSAGING_COACHES_ONLY",
      error: "This member only accepts messages from coaches and admins."
    };
  }
  if (includesCode(m, "MESSAGING_DISABLED")) {
    return {
      status: 403,
      code: "MESSAGING_DISABLED",
      error: "This member has turned off incoming messages."
    };
  }
  if (includesCode(m, "MESSAGING_CONNECTIONS_ONLY")) {
    return {
      status: 403,
      code: "MESSAGING_CONNECTIONS_ONLY",
      error: "You can only message this member if you have an active coach connection with them."
    };
  }
  if (includesCode(m, "MESSAGING_NOT_ALLOWED")) {
    return {
      status: 403,
      code: "MESSAGING_NOT_ALLOWED",
      error: "Messaging is not allowed with this user."
    };
  }
  if (includesCode(m, "MESSAGING_SENDER_MISMATCH")) {
    return {
      status: 403,
      code: "MESSAGING_SENDER_MISMATCH",
      error: "Invalid sender for this message."
    };
  }
  if (includesCode(m, "MESSAGING_INVALID_CONVERSATION") || includesCode(m, "MESSAGING_PEER_NOT_FOUND")) {
    return {
      status: 400,
      code: "MESSAGING_INVALID_CONVERSATION",
      error: "This conversation is not valid for sending messages."
    };
  }
  if (includesCode(m, "MESSAGING_UNSUPPORTED_GROUP")) {
    return {
      status: 400,
      code: "MESSAGING_UNSUPPORTED_GROUP",
      error: "Group messaging is not supported."
    };
  }

  const low = m.toLowerCase();
  if (low.includes("messaging not allowed") || (low.includes("not allowed") && low.includes("messag"))) {
    return {
      status: 403,
      code: "MESSAGING_BLOCKED",
      error: "Messaging is not allowed with this user."
    };
  }

  return null;
}
