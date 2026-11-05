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

function FormattedReply({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className='space-y-2 text-[15px] leading-relaxed'>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className='h-2' />;
        if (/^[-•*]\s+/.test(trimmed)) {
          return (
            <div key={i} className='flex gap-2.5 pl-0.5'>
              <span className='text-muted-foreground mt-2 size-1 shrink-0 rounded-full bg-current' />
              <span>{formatInline(trimmed.replace(/^[-•*]\s+/, ''))}</span>
            </div>
          );
        }
        return <p key={i}>{formatInline(line)}</p>;
      })}
    </div>
  );
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
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
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
    function onActive(e: Event) {
      const id = (e as CustomEvent<{ id: string | null }>).detail?.id;
      if (!id || loading) return;
      if (id === activeIdRef.current) {
        // same id — still reload messages if sidebar restored from storage
        const fromStore = loadThreads().find((t) => t.id === id);
        if (fromStore) {
          setThreads((prev) => {
            const others = prev.filter((t) => t.id !== id);
            return sortThreads([fromStore, ...others]);
          });
        }
        return;
      }
      setThreads((prev) => {
        const fromStore = loadThreads().find((t) => t.id === id);
        if (fromStore) {
          const others = prev.filter((t) => t.id !== id);
          return sortThreads([fromStore, ...others]);
        }
        if (prev.some((t) => t.id === id)) return prev;
        return [...prev, { ...createThread(), id }];
      });
      setActiveId(id);
      setError(null);
      setInput('');
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
      setThreads((prev) => {
        const kept = prev.filter((t) =>
          t.messages.some((m) => m.text.trim() && !m.pending)
        );
        return [fresh, ...kept];
      });
      setActiveId(id);
      setError(null);
      setInput('');
    }

    window.addEventListener(ACTIVE_THREAD_EVENT, onActive);
    window.addEventListener('uzex-ai-new-chat', onNewChat);
    return () => {
      window.removeEventListener(ACTIVE_THREAD_EVENT, onActive);
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
    saveThreads(threads);
  }, [threads, hydrated]);

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

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          message,
          locale,
          mode: deepAnalysis ? 'deep' : 'default',
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
  const composerExpanded = composerFocused || input.trim().length > 0 || !isEmpty;

  const composer = (
    <div
      className={cn(
        'bg-muted/80 dark:bg-muted/50 w-full border border-black/5 shadow-lg backdrop-blur-md transition-all duration-300 ease-out dark:border-white/10',
        isEmpty ? 'max-w-2xl' : 'max-w-3xl',
        composerExpanded ? 'rounded-[1.75rem] p-3 sm:p-3.5' : 'rounded-full px-2 py-1.5 sm:px-2.5'
      )}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setComposerFocused(true)}
        onBlur={() => setComposerFocused(false)}
        placeholder={t('ai.askMarket')}
        rows={1}
        className={cn(
          'max-h-48 min-h-11 w-full resize-none border-0 bg-transparent px-2.5 py-2.5 text-[15px] leading-relaxed shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent',
          composerExpanded ? 'min-h-16' : 'min-h-11'
        )}
        data-testid='ai-chat-input'
        aria-label={t('ai.askMarket')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void send(input);
          }
        }}
      />

      <div
        className={cn(
          'flex items-center gap-2 px-0.5',
          composerExpanded ? 'mt-1 justify-between pt-1' : 'justify-between'
        )}
      >
        <div className='flex min-w-0 items-center gap-1.5'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-full'
            aria-label={t('ai.composerPlus')}
            aria-expanded={showQuickPrompts}
            onClick={() => setShowQuickPrompts((v) => !v)}
          >
            <Icons.add className='size-4' />
          </Button>
          {composerExpanded ? (
            <p className='text-muted-foreground hidden truncate text-[11px] sm:block'>
              {t('ai.enterHint')}
            </p>
          ) : null}
        </div>

        <div className='flex shrink-0 items-center gap-1.5'>
          <button
            type='button'
            title={t('ai.deepAnalysisHint')}
            aria-pressed={deepAnalysis}
            onClick={() => setDeepAnalysis((v) => !v)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors',
              deepAnalysis
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icons.sparkles className='size-3.5' />
            <span className='hidden sm:inline'>{t('ai.deepAnalysis')}</span>
          </button>

          <Button
            data-testid='ai-chat-send'
            size='icon-sm'
            className={cn(
              'size-9 rounded-full shadow-sm transition-opacity',
              canSend ? 'opacity-100' : 'opacity-45'
            )}
            disabled={!canSend}
            onClick={() => void send(input)}
            aria-label={t('ai.send')}
          >
            {loading ? (
              <Icons.spinner className='size-4 animate-spin' />
            ) : (
              <Icons.arrowUp className='size-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className='relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden'
      data-testid='ai-chat-root'
      data-hydrated={hydrated ? 'true' : 'false'}
      data-empty={isEmpty ? 'true' : 'false'}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 transition-[justify-content,gap] duration-500 ease-out sm:px-4',
          isEmpty ? 'justify-center gap-6 pb-8' : 'justify-end gap-0 pb-3'
        )}
      >
        {!isEmpty ? (
          <div
            ref={scrollRef}
            className='min-h-0 flex-1 space-y-6 overflow-y-auto py-6'
          >
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
        ) : (
          <div className='space-y-3 text-center'>
            <p className='text-foreground text-3xl font-medium tracking-tight sm:text-4xl'>
              {t('ai.startPrompt')}
            </p>
            <p className='text-muted-foreground text-sm'>{t('ai.askHint')}</p>
          </div>
        )}

        <div
          className={cn(
            'flex w-full flex-col items-center gap-3 transition-all duration-500 ease-out',
            isEmpty ? '' : 'pt-2'
          )}
        >
          {composer}
          {(isEmpty || showQuickPrompts) && (
            <div
              className='flex max-w-2xl flex-wrap justify-center gap-2'
              data-testid='ai-suggested-prompts'
            >
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type='button'
                  className='hover:bg-muted rounded-full bg-muted/40 px-3.5 py-2 text-left text-xs transition-colors'
                  onClick={() => {
                    setShowQuickPrompts(false);
                    void send(prompt);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {!isEmpty && !showQuickPrompts ? (
            <p className='text-muted-foreground text-center text-[11px]'>{t('ai.scopeHint')}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
