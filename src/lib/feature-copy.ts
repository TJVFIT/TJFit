import type { Locale } from "@/lib/i18n";

const messages = {
  encrypted: "End-to-end encrypted",
  title: "Coach messages",
  subtitle: "Private conversations between members and their assigned coaches.",
  missingPublicKeys: "Secure keys are still being prepared. Try again in a moment.",
  sendError: "The secure conversation could not be created.",
  chatLocked: "Coach messaging unlocks when an active coaching relationship begins.",
  startSecureChat: "Open your private thread with your assigned coach.",
  createPrivateThread: "Create a private conversation with a member.",
  participantPlaceholder: "Participant ID",
  openChat: "Open chat",
  create: "Create",
  chatUnavailable: "No coach conversation is available yet.",
  noConversations: "No conversations yet."
};

export function getMessagesCopy(locale: Locale) {
  void locale;
  return messages;
}
