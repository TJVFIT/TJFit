/** Pending sends stay in memory: never write chat contents to browser storage. */
export type ChatSendPayload = { message: string; conversationId: string; locale: string };
export type ChatSendAttempt = ChatSendPayload & { requestId: string };
export type DeliveredChatMessage = { id: string; role: 'user' | 'assistant'; content: string; created_at?: string };

export function createChatRetryController(makeId: () => string = () => crypto.randomUUID()) {
  let pending: ChatSendAttempt | null = null;
  const matches = (payload: ChatSendPayload) => Boolean(pending && pending.message === payload.message.trim() && pending.conversationId === payload.conversationId && pending.locale === payload.locale);
  return {
    matches,
    preservePendingConversation(currentId: string, selectedId: string) {
      return currentId === selectedId && pending?.conversationId === currentId;
    },
    begin(payload: ChatSendPayload): ChatSendAttempt {
      if (!matches(payload)) pending = { ...payload, message: payload.message.trim(), requestId: makeId() };
      return pending!;
    },
    acknowledge(requestId: string) { if (pending?.requestId === requestId) pending = null; },
    newIntent() { pending = null; }
  };
}

export class ChatDeliveryError extends Error {
  constructor(public status: number) { super('chat_delivery_failed'); }
}

export async function deliverChatAttempt(attempt: ChatSendAttempt, signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<string> {
  const response = await fetcher('/api/tjai/chat', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt), signal
  });
  if (!response.ok) throw new ChatDeliveryError(response.status);
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object') throw new ChatDeliveryError(502);
  const reply = data as Record<string, unknown>;
  if (typeof reply.message !== 'string' || !reply.message.trim() || reply.conversationId !== attempt.conversationId || (reply.requestId !== undefined && reply.requestId !== attempt.requestId)) throw new ChatDeliveryError(502);
  return reply.message.trim();
}

export function restoreUnsentChatInput(current: string, failedMessage: string): string {
  return current.trim() ? current : failedMessage;
}

export async function loadChatMessages(conversationId: string, fetcher: typeof fetch = fetch): Promise<DeliveredChatMessage[]> {
  const response = await fetcher('/api/tjai/chat/conversations?conversationId=' + encodeURIComponent(conversationId), { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new ChatDeliveryError(response.status);
  const data: unknown = await response.json();
  const rows = data && typeof data === 'object' ? (data as Record<string, unknown>).messages : undefined;
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || typeof row.id !== 'string' || !['user', 'assistant'].includes(row.role) || typeof row.content !== 'string' || (row.created_at !== undefined && typeof row.created_at !== 'string'))) throw new ChatDeliveryError(502);
  return rows.map(row => ({ id: row.id, role: row.role, content: row.content, created_at: row.created_at }));
}
