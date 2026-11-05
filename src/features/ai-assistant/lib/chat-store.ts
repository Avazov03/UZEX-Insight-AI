export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  tools?: Array<{ name: string }>;
  pending?: boolean;
};

export type ChatThread = {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: number;
  messages: ChatMessage[];
};

export type HistoryTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export const THREADS_STORAGE_KEY = 'uzex-ai-threads-v1';
export const ACTIVE_THREAD_KEY = 'uzex-ai-active-thread';
export const THREADS_EVENT = 'uzex-ai-threads';
export const ACTIVE_THREAD_EVENT = 'uzex-ai-active-thread';

const MAX_THREADS = 40;
const MAX_HISTORY_TURNS = 24;

export function createThread(): ChatThread {
  return {
    id: crypto.randomUUID(),
    title: '',
    pinned: false,
    updatedAt: Date.now(),
    messages: []
  };
}

export function titleFromMessage(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean;
}

export function toHistoryTurns(messages: ChatMessage[]): HistoryTurn[] {
  return messages
    .filter((m) => !m.pending && m.text.trim().length > 0)
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.text }));
}

export function sortThreads(threads: ChatThread[]): ChatThread[] {
  return [...threads].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function loadThreads(): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(THREADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is ChatThread => {
        if (!item || typeof item !== 'object') return false;
        const t = item as ChatThread;
        return typeof t.id === 'string' && Array.isArray(t.messages);
      })
      .map((t) => ({
        id: t.id,
        title: typeof t.title === 'string' ? t.title : '',
        pinned: Boolean(t.pinned),
        updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
        messages: t.messages
          .filter(
            (m): m is ChatMessage =>
              !!m &&
              typeof m.id === 'string' &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.text === 'string'
          )
          .map((m) => ({
            id: m.id,
            role: m.role,
            text: m.text,
            tools: m.tools,
            pending: false
          }))
      }));
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = sortThreads(threads)
      .map((t) => ({
        ...t,
        messages: t.messages.filter((m) => !m.pending)
      }))
      .filter((t) => t.messages.length > 0)
      .slice(0, MAX_THREADS);
    const next = JSON.stringify(cleaned);
    const prev = window.localStorage.getItem(THREADS_STORAGE_KEY);
    if (prev === next) return;
    window.localStorage.setItem(THREADS_STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent(THREADS_EVENT));
  } catch {
    // quota / private mode — ignore
  }
}

export function getActiveThreadId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACTIVE_THREAD_KEY);
  } catch {
    return null;
  }
}

export function setActiveThreadId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const prev = window.localStorage.getItem(ACTIVE_THREAD_KEY);
    if ((id ?? null) === prev) return;
    if (id) window.localStorage.setItem(ACTIVE_THREAD_KEY, id);
    else window.localStorage.removeItem(ACTIVE_THREAD_KEY);
    window.dispatchEvent(
      new CustomEvent(ACTIVE_THREAD_EVENT, { detail: { id } })
    );
  } catch {
    // ignore
  }
}

/** Persist thread list mutations from sidebar (pin/rename/delete). */
export function updateStoredThreads(
  updater: (threads: ChatThread[]) => ChatThread[]
): ChatThread[] {
  const next = updater(loadThreads());
  saveThreads(next);
  return next;
}
