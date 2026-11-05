'use client';

import { useState } from 'react';
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
  tools?: Array<{ name: string; result: unknown }>;
};

export function LiveAiChat() {
  const { t, locale } = useI18n();
  const [input, setInput] = useState('');
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setError(null);
    setLoading(true);
    const userItem: ChatItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: message
    };
    setItems((prev) => [...prev, userItem]);
    setInput('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, locale })
      });
      const data = (await res.json()) as {
        ok: boolean;
        reply?: string;
        tools?: ChatItem['tools'];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'AI request failed');
      }
      setItems((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply || '',
          tools: data.tools
        }
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='bg-card flex min-h-[calc(100dvh-8rem)] flex-1 flex-col overflow-hidden rounded-xl border'>
      <div className='flex shrink-0 items-center gap-2 border-b px-4 py-3'>
        <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
          <Icons.sparkles className='size-4' />
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>{t('ai.analyst')}</p>
          <p className='text-muted-foreground text-xs'>Live OpenAI · PostgreSQL tools</p>
        </div>
        <Badge variant='outline' className='ml-auto'>
          {loading ? t('ai.analyzing') : 'ready'}
        </Badge>
      </div>

      <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
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
                  className='hover:bg-accent rounded-full border px-3 py-1 text-left text-xs transition-colors'
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
              <div className='max-w-[85%] space-y-2'>
                <Bubble variant={item.role === 'user' ? 'default' : 'muted'}>
                  <BubbleContent className='whitespace-pre-wrap'>{item.text}</BubbleContent>
                </Bubble>
                {item.tools?.length ? (
                  <pre className='bg-muted/50 overflow-x-auto rounded-lg border p-2 font-mono text-[10px]'>
                    {JSON.stringify(
                      item.tools.map((t) => ({ name: t.name, result: t.result })),
                      null,
                      2
                    )}
                  </pre>
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
        <div className='flex justify-end'>
          <Button disabled={loading || !input.trim()} onClick={() => void send(input)}>
            {loading ? <Icons.spinner className='size-4 animate-spin' /> : <Icons.send className='size-4' />}
            {t('common.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
