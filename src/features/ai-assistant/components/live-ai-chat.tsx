'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { suggestedPrompts } from '../chat';
import {
  ACTIVE_THREAD_EVENT,
  THREADS_EVENT,
  createThread,
  getActiveThreadId,
  loadThreads,
  saveThreads,
  setActiveThreadId,
  sortThreads,
  titleFromMessage,
  toHistoryTurns,
  type ChatThread
} from '../lib/chat-store';

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className='font-semibold'>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function splitTableCells(line: string): string[] {
  const raw = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return raw.split('|').map((c) => c.trim());
}

function isTableSep(line: string): boolean {
  const t = line.trim();
  if (!t.includes('|') && !t.includes('-')) return false;
  return /^[\s|:-]+$/.test(t) && /-/.test(t);
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.includes('|') && !isTableSep(t);
}

function MarkdownTable({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div className='border-border bg-card/40 my-3 overflow-x-auto rounded-xl border'>
      <table className='w-full min-w-[28rem] border-collapse text-left text-sm'>
        <thead>
          <tr className='bg-muted/60 border-border border-b'>
            {header.map((cell, i) => (
              <th
                key={i}
                className='text-foreground px-3 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap'
              >
                {formatInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr
              key={ri}
              className='border-border/70 hover:bg-muted/30 border-b last:border-b-0'
            >
              {header.map((_, ci) => (
                <td key={ci} className='text-foreground/90 px-3 py-2 whitespace-nowrap'>
                  {formatInline(row[ci] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormattedReply({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push(<div key={`sp-${i}`} className='h-2' />);
      i += 1;
      continue;
    }

    // GFM table: header + separator + rows
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSep(lines[i + 1] ?? '')) {
      const tableLines: string[] = [trimmed];
      i += 2; // skip separator
      while (i < lines.length && isTableRow(lines[i] ?? '')) {
        tableLines.push((lines[i] ?? '').trim());
        i += 1;
      }
      const rows = tableLines.map(splitTableCells);
      blocks.push(<MarkdownTable key={`tbl-${blocks.length}`} rows={rows} />);
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      blocks.push(
        <h3 key={`h3-${i}`} className='text-foreground pt-2 text-base font-semibold tracking-tight'>
          {formatInline(h3[1] ?? '')}
        </h3>
      );
      i += 1;
      continue;
    }

    const h4 = trimmed.match(/^####\s+(.+)$/);
    if (h4) {
      blocks.push(
        <h4 key={`h4-${i}`} className='text-foreground/90 pt-1 text-sm font-semibold'>
          {formatInline(h4[1] ?? '')}
        </h4>
      );
      i += 1;
      continue;
    }

    if (/^[-•*]\s+/.test(trimmed)) {
      blocks.push(
        <div key={`li-${i}`} className='flex gap-2.5 pl-0.5'>
          <span className='text-muted-foreground mt-2 size-1 shrink-0 rounded-full bg-current' />
          <span>{formatInline(trimmed.replace(/^[-•*]\s+/, ''))}</span>
        </div>
      );
      i += 1;
      continue;
    }

    // Skip orphan markdown table separator lines
    if (isTableSep(trimmed)) {
      i += 1;
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className='text-[15px] leading-relaxed'>
        {formatInline(line)}
      </p>
    );
    i += 1;
  }

  return <div className='space-y-1.5 text-[15px] leading-relaxed'>{blocks}</div>;
}

function toolLabel(name: string, t: (key: string) => string): string {
  switch (name) {
    case 'get_market_overview':
      return t('ai.toolOverview');
    case 'analyze_product_prices':
      return t('ai.toolPrices');
    case 'detect_delivery_risk':
      return t('ai.toolRisk');
    case 'compare_years':
      return t('ai.toolCompare');
    case 'get_deal_by_number':
      return t('ai.toolDeal');
    case 'get_contract_by_number':
      return t('ai.toolContract');
    case 'lookup_participant':
      return t('ai.toolParticipant');
    case 'lookup_broker':
      return t('ai.toolBroker');
    case 'get_status_glossary':
      return t('ai.toolStatus');
    case 'get_trade_type_stats':
      return t('ai.toolAuction');
    case 'analyze_deadline_breaches':
      return t('ai.toolDeadlines');
    case 'get_usd_rate':
      return t('ai.toolUsd');
    case 'analyze_region_trade':
      return t('ai.toolRegion');
    default:
      return name;
  }
}

function ThinkingLoader({
  label,
  tools
}: {
  label: string;
  tools?: Array<{ name: string }>;
}) {
  return (
    <div className='flex flex-col gap-2 py-1' role='status' aria-live='polite'>
      <div className='flex items-center gap-2.5'>
        <Icons.sparkles className='text-primary size-4 animate-pulse' />
        <span className='shimmer text-muted-foreground text-sm font-medium'>{label}</span>
      </div>
      {tools?.length ? (
        <p className='text-muted-foreground flex items-center gap-1.5 pl-6 text-[11px]'>
          <Icons.chartBar className='size-3' />
          {tools.map((tool) => tool.name).join(', ')}
        </p>
      ) : null}
    </div>
  );
}

function parseSseChunk(
  buffer: string,
  onEvent: (event: string, data: unknown) => void
): string {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const block of parts) {
    let event = 'message';
    let dataLine = '';
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      if (line.startsWith('data:')) dataLine += line.slice(5).trim();
    }
    if (!dataLine) continue;
    try {
      onEvent(event, JSON.parse(dataLine) as unknown);
    } catch {
      // ignore malformed
    }
  }
  return rest;
}

export function LiveAiChat() {
  const { t, locale } = useI18n();
  const [input, setInput] = useState('');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef(activeId);
  const threadsRef = useRef(threads);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  useEffect(() => {
    const saved = loadThreads();
    const sorted = sortThreads(saved);
    const preferred = getActiveThreadId();
    const draft = createThread();

    if (sorted.length) {
      const startId =
        preferred && sorted.some((t) => t.id === preferred)
          ? preferred
          : sorted[0]!.id;
      setThreads(sorted);
      setActiveId(startId);
      setActiveThreadId(startId);
    } else {
      setThreads([draft]);
      setActiveId(draft.id);
      setActiveThreadId(draft.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    /**
     * localStorage is source of truth for *other* threads.
     * Never replace the active in-flight thread — that was wiping streamed answers.
     */
    function syncFromStore(preferredActiveId?: string | null) {
      const stored = sortThreads(loadThreads());
      const storedIds = new Set(stored.map((t) => t.id));
      const active = preferredActiveId ?? activeIdRef.current;

      setThreads((prev) => {
        const prevActive = prev.find((t) => t.id === active);
        const inFlight =
          !!prevActive &&
          (loading ||
            prevActive.messages.some((m) => m.pending) ||
            // brand-new empty draft not yet in storage
            (!storedIds.has(prevActive.id) &&
              !prevActive.messages.some((m) => m.text.trim() && !m.pending)));

        if (inFlight && prevActive) {
          const others = stored.filter((t) => t.id !== prevActive.id);
          return sortThreads([prevActive, ...others]);
        }

        if (stored.length) return stored;
        if (prevActive) return [prevActive];
        return [createThread()];
      });

      if (active && !storedIds.has(active)) {
        const prevActive = threadsRef.current.find((t) => t.id === active);
        const hold =
          loading ||
          !!prevActive?.messages.some((m) => m.pending) ||
          (!!prevActive &&
            !prevActive.messages.some((m) => m.text.trim() && !m.pending));
        if (!hold) {
          const nextId = stored[0]?.id;
          if (nextId) {
            setActiveId(nextId);
          } else {
            const draft = createThread();
            setThreads([draft]);
            setActiveId(draft.id);
            setActiveThreadId(draft.id);
          }
        }
      }
    }

    function onActive(e: Event) {
      const id = (e as CustomEvent<{ id: string | null }>).detail?.id;
      if (!id || loading) return;
      syncFromStore(id);
      if (id !== activeIdRef.current) {
        setActiveId(id);
        setError(null);
        setInput('');
      }
    }

    function onThreadsChanged() {
      // While answering, only prune deleted siblings — keep streaming text
      syncFromStore();
    }

    function onNewChat(e: Event) {
      if (loading) return;
      const id =
        (e as CustomEvent<{ id: string }>).detail?.id ?? createThread().id;
      if (id === activeIdRef.current) {
        const current = threadsRef.current.find((t) => t.id === id);
        if (current && current.messages.length === 0) return;
      }
      const fresh = { ...createThread(), id };
      const stored = sortThreads(loadThreads());
      setThreads([fresh, ...stored.filter((t) => t.id !== fresh.id)]);
      setActiveId(id);
      setError(null);
      setInput('');
    }

    window.addEventListener(ACTIVE_THREAD_EVENT, onActive);
    window.addEventListener(THREADS_EVENT, onThreadsChanged);
    window.addEventListener('uzex-ai-new-chat', onNewChat);
    return () => {
      window.removeEventListener(ACTIVE_THREAD_EVENT, onActive);
      window.removeEventListener(THREADS_EVENT, onThreadsChanged);
      window.removeEventListener('uzex-ai-new-chat', onNewChat);
    };
  }, [loading]);

  const activeThread = useMemo(
    () => threads.find((x) => x.id === activeId) ?? threads[0],
    [threads, activeId]
  );
  const items = activeThread?.messages ?? [];
  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!hydrated) return;
    // Persist without resurrecting threads the sidebar already deleted
    const storedIds = new Set(loadThreads().map((t) => t.id));
    const toSave = threads.filter((t) => storedIds.has(t.id) || t.id === activeId);
    // Silent during stream so THREADS_EVENT cannot clobber the live answer
    saveThreads(toSave, { silent: loading });
  }, [threads, hydrated, activeId, loading]);

  useEffect(() => {
    if (!hydrated || !activeId) return;
    if (getActiveThreadId() === activeId) return;
    setActiveThreadId(activeId);
  }, [activeId, hydrated]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, loading]);

  function updateThread(id: string, updater: (thread: ChatThread) => ChatThread) {
    setThreads((prev) => {
      const has = prev.some((t) => t.id === id);
      if (!has) return [...prev, updater({ ...createThread(), id })];
      return prev.map((thread) => (thread.id === id ? updater(thread) : thread));
    });
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setError(null);
    setLoading(true);

    let threadId = activeIdRef.current;
    const current = threadsRef.current.find((t) => t.id === threadId);
    let historyPayload = toHistoryTurns(current?.messages ?? []);

    if (!threadId || !current) {
      const fresh = createThread();
      threadId = fresh.id;
      setActiveId(fresh.id);
      activeIdRef.current = fresh.id;
      setActiveThreadId(fresh.id);
      historyPayload = [];
      setThreads((prev) => [
        fresh,
        ...prev.filter((t) => t.messages.some((m) => m.text.trim() && !m.pending))
      ]);
    }

    const userId = `u-${crypto.randomUUID()}`;
    const assistantId = `a-${crypto.randomUUID()}`;
    const now = Date.now();

    updateThread(threadId, (thread) => ({
      ...thread,
      title: thread.title || titleFromMessage(message),
      updatedAt: now,
      messages: [
        ...thread.messages,
        { id: userId, role: 'user', text: message },
        { id: assistantId, role: 'assistant', text: '', pending: true }
      ]
    }));
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          message,
          locale,
          mode: 'default',
          history: historyPayload
        })
      });

      if (!res.ok || !res.body) {
        const errBody = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errBody?.error || 'AI request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let gotToken = false;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, (event, data) => {
          if (event === 'meta') {
            const tools = (data as { tools?: Array<{ name: string }> }).tools ?? [];
            updateThread(threadId, (thread) => ({
              ...thread,
              messages: thread.messages.map((item) =>
                item.id === assistantId ? { ...item, tools, pending: !gotToken } : item
              )
            }));
          }
          if (event === 'token') {
            const chunk = (data as { t?: string }).t ?? '';
            if (!chunk) return;
            gotToken = true;
            updateThread(threadId, (thread) => ({
              ...thread,
              messages: thread.messages.map((item) =>
                item.id === assistantId
                  ? { ...item, text: item.text + chunk, pending: false }
                  : item
              )
            }));
          }
          if (event === 'error') {
            streamError = (data as { message?: string }).message || 'Stream error';
          }
        });
        if (streamError) throw new Error(streamError);
      }

      updateThread(threadId, (thread) => ({
        ...thread,
        updatedAt: Date.now(),
        messages: thread.messages.map((item) =>
          item.id === assistantId
            ? { ...item, pending: false, text: item.text || t('ai.emptyReply') }
            : item
        )
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      updateThread(threadId, (thread) => ({
        ...thread,
        messages: thread.messages.filter(
          (item) => !(item.id === assistantId && !item.text)
        )
      }));
    } finally {
      setLoading(false);
    }
  }

  const canSend = Boolean(input.trim()) && !loading;

  const composer = (
    <div
      className={cn(
        'bg-muted/80 flex w-full items-end gap-2 rounded-3xl border border-black/5 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-muted/50',
        'focus-within:ring-ring/20 focus-within:ring-1'
      )}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          const el = e.target;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        }}
        placeholder={t('ai.askMarket')}
        rows={1}
        className='max-h-40 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 text-sm leading-5 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent'
        data-testid='ai-chat-input'
        aria-label={t('ai.askMarket')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void send(input);
          }
        }}
      />

      <Button
        data-testid='ai-chat-send'
        size='icon-sm'
        className={cn(
          'mb-0.5 size-8 shrink-0 rounded-full shadow-sm transition-opacity',
          canSend ? 'opacity-100' : 'opacity-40'
        )}
        disabled={!canSend}
        onClick={() => void send(input)}
        aria-label={t('ai.send')}
      >
        {loading ? (
          <Icons.spinner className='size-3.5 animate-spin' />
        ) : (
          <Icons.arrowUp className='size-3.5' />
        )}
      </Button>
    </div>
  );

  const quickPrompts = (
    <div
      className='flex w-full max-w-3xl flex-wrap justify-center gap-2'
      data-testid='ai-suggested-prompts'
    >
      {suggestedPrompts.map((prompt) => (
        <button
          key={prompt}
          type='button'
          className='hover:bg-muted rounded-full bg-muted/40 px-3.5 py-2 text-left text-xs transition-colors'
          onClick={() => void send(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className='relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden'
      data-testid='ai-chat-root'
      data-hydrated={hydrated ? 'true' : 'false'}
      data-empty={isEmpty ? 'true' : 'false'}
    >
      {isEmpty ? (
        <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-8 sm:px-4'>
          <div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-6'>
            <div className='space-y-2 text-center'>
              <p className='text-foreground text-3xl font-medium tracking-tight sm:text-4xl'>
                {t('ai.startPrompt')}
              </p>
              <p className='text-muted-foreground text-sm'>{t('ai.askHint')}</p>
            </div>
            {composer}
            {quickPrompts}
          </div>
        </div>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <div
            ref={scrollRef}
            className='min-h-0 flex-1 overflow-y-auto overscroll-contain'
          >
            <div className='mx-auto w-full max-w-3xl space-y-6 px-3 py-6 sm:px-4'>
              {items.map((item) => (
                <div key={item.id} className='w-full'>
                  {item.role === 'user' ? (
                    <div className='flex justify-end'>
                      <div className='bg-muted max-w-[min(100%,34rem)] rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed'>
                        <span className='whitespace-pre-wrap'>{item.text}</span>
                      </div>
                    </div>
                  ) : (
                    <div className='w-full space-y-2'>
                      {item.pending && !item.text ? (
                        <ThinkingLoader
                          label={
                            item.tools?.length ? t('ai.searching') : t('ai.thinking')
                          }
                          tools={item.tools}
                        />
                      ) : (
                        <FormattedReply text={item.text} />
                      )}
                      {!item.pending && item.tools?.length ? (
                        <p className='text-muted-foreground flex items-center gap-1.5 text-[11px]'>
                          <Icons.chartBar className='size-3' />
                          {t('ai.tools')}:{' '}
                          {item.tools.map((tool) => toolLabel(tool.name, t)).join(', ')}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              {error ? (
                <p className='text-destructive text-center text-sm'>{error}</p>
              ) : null}
            </div>
          </div>

          <div className='bg-background shrink-0'>
            <div className='mx-auto w-full max-w-3xl px-3 pt-2 pb-3 sm:px-4'>
              {composer}
              <p className='text-muted-foreground mt-2 text-center text-[11px]'>
                {t('ai.scopeHint')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
