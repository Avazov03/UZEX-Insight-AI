'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { suggestedPrompts } from '../chat';

type ChatItem = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  tools?: Array<{ name: string }>;
  pending?: boolean;
};

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
    <div className='space-y-1.5 text-sm leading-relaxed'>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className='h-1.5' />;
        if (/^[-•*]\s+/.test(trimmed)) {
          return (
            <div key={i} className='flex gap-2 pl-0.5'>
              <span className='text-muted-foreground mt-1.5 size-1 shrink-0 rounded-full bg-current' />
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

function PendingBubble() {
  return (
    <Bubble variant='muted'>
      <BubbleContent>
        <div className='flex items-center gap-2 py-0.5' role='status' aria-label='loading'>
          <span className='bg-muted-foreground/40 size-1.5 animate-pulse rounded-full' />
          <span className='bg-muted-foreground/40 size-1.5 animate-pulse rounded-full [animation-delay:120ms]' />
          <span className='bg-muted-foreground/40 size-1.5 animate-pulse rounded-full [animation-delay:240ms]' />
        </div>
        <div className='mt-3 space-y-2'>
          <div className='bg-muted-foreground/15 h-3 w-48 animate-pulse rounded' />
          <div className='bg-muted-foreground/15 h-3 w-36 animate-pulse rounded' />
        </div>
      </BubbleContent>
    </Bubble>
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
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, loading]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setError(null);
    setLoading(true);

    const assistantId = `a-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: message },
      { id: assistantId, role: 'assistant', text: '', pending: true }
    ]);
    setInput('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ message, locale })
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
            setItems((prev) =>
              prev.map((item) =>
                item.id === assistantId ? { ...item, tools, pending: !gotToken } : item
              )
            );
          }
          if (event === 'token') {
            const chunk = (data as { t?: string }).t ?? '';
            if (!chunk) return;
            gotToken = true;
            setItems((prev) =>
              prev.map((item) =>
                item.id === assistantId
                  ? { ...item, text: item.text + chunk, pending: false }
                  : item
              )
            );
          }
          if (event === 'error') {
            streamError = (data as { message?: string }).message || 'Stream error';
          }
        });
        if (streamError) throw new Error(streamError);
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                pending: false,
                text: item.text || t('ai.emptyReply')
              }
            : item
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setItems((prev) =>
        prev.filter((item) => !(item.id === assistantId && !item.text))
      );
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    if (loading) return;
    setItems([]);
    setError(null);
    setInput('');
  }

  return (
    <div className='bg-card flex min-h-[calc(100dvh-8rem)] flex-1 flex-col overflow-hidden rounded-xl border'>
      <div className='flex shrink-0 items-center gap-2 border-b px-4 py-3'>
        <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
          <Icons.sparkles className='size-4' />
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>{t('ai.analyst')}</p>
          <p className='text-muted-foreground text-xs'>{t('ai.analystHint')}</p>
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={newChat}
            disabled={loading || items.length === 0}
          >
            <Icons.add className='size-4' />
            {t('ai.newChat')}
          </Button>
          <Badge variant='outline'>{loading ? t('ai.analyzing') : t('ai.ready')}</Badge>
        </div>
      </div>

      <div ref={scrollRef} className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
        {items.length === 0 ? (
          <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-4 text-center text-sm'>
            <Icons.sparkles className='text-primary size-10' />
            <div className='max-w-md space-y-1'>
              <p className='text-foreground text-base font-medium'>{t('ai.askMarket')}</p>
              <p>{t('ai.askHint')}</p>
            </div>
            <div className='flex max-w-lg flex-wrap justify-center gap-2'>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type='button'
                  className='hover:bg-accent rounded-full border px-3 py-1.5 text-left text-xs transition-colors'
                  onClick={() => void send(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn('flex', item.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className='max-w-[min(100%,42rem)] space-y-2'>
                {item.pending && !item.text ? (
                  <PendingBubble />
                ) : (
                  <Bubble variant={item.role === 'user' ? 'default' : 'muted'}>
                    <BubbleContent>
                      {item.role === 'assistant' ? (
                        <FormattedReply text={item.text} />
                      ) : (
                        <span className='whitespace-pre-wrap'>{item.text}</span>
                      )}
                    </BubbleContent>
                  </Bubble>
                )}
                {item.role === 'assistant' && item.tools?.length ? (
                  <p className='text-muted-foreground flex items-center gap-1.5 px-1 text-[11px]'>
                    <Icons.chartBar className='size-3' />
                    {t('ai.tools')}:{' '}
                    {item.tools.map((tool) => toolLabel(tool.name, t)).join(', ')}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}
        {error ? <p className='text-destructive text-sm'>{error}</p> : null}
      </div>

      <div className='shrink-0 space-y-2 border-t p-3'>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ai.askMarket')}
          className='min-h-20 resize-none'
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <div className='flex items-center justify-between gap-2'>
          <p className='text-muted-foreground text-[11px]'>{t('ai.enterHint')}</p>
          <Button disabled={loading || !input.trim()} onClick={() => void send(input)}>
            {loading ? (
              <Icons.spinner className='size-4 animate-spin' />
            ) : (
              <Icons.send className='size-4' />
            )}
            {t('ai.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}
