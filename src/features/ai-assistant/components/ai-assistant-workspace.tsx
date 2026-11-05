'use client';

import { useChat } from '@ai-sdk/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport
} from '@/components/ui/message-scroller';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import {
  chatTransport,
  demoChat,
  initialMessages,
  suggestedPrompts,
  type DemoUIMessage
} from '../chat';

type ToolPart = {
  type: string;
  toolName?: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const conversations = [
  {
    id: '1',
    title: 'Paxta narx tahlili',
    preview: '2026 YTD vs 2025',
    active: true
  },
  {
    id: '2',
    title: 'Yetkazib berish riski',
    preview: 'Muddat buzilishi',
    active: false
  },
  {
    id: '3',
    title: 'Broker konsentratsiya',
    preview: 'Bekor qilingan bitimlar',
    active: false
  }
] as const;

function ToolMarker({ part }: { part: ToolPart }) {
  const name = part.toolName ?? part.type.replace(/^tool-/, '');
  const running = part.state === 'input-streaming' || part.state === 'input-available';
  const done = part.state === 'output-available';
  const errored = part.state === 'output-error';

  return (
    <div className='flex flex-col gap-1.5'>
      <Marker>
        <MarkerIcon>
          <Icons.code />
        </MarkerIcon>
        {running ? (
          <MarkerContent className='shimmer'>Running {name}…</MarkerContent>
        ) : (
          <MarkerContent>
            {errored ? 'Failed' : 'Called'}{' '}
            <span className='text-foreground font-medium'>{name}</span>
          </MarkerContent>
        )}
      </Marker>
      {done && part.output != null && (
        <Bubble variant='outline'>
          <BubbleContent>
            <pre className='overflow-x-auto font-mono text-xs'>
              {JSON.stringify(part.output, null, 2)}
            </pre>
          </BubbleContent>
        </Bubble>
      )}
      {errored && part.errorText && <p className='text-destructive text-sm'>{part.errorText}</p>}
    </div>
  );
}

function ContextPanel() {
  return (
    <aside className='bg-card hidden w-72 shrink-0 flex-col overflow-hidden rounded-xl border xl:flex'>
      <div className='border-b px-4 py-3'>
        <p className='text-sm font-medium'>Analysis Context</p>
        <p className='text-muted-foreground text-xs'>Joriy so‘rov filtrlari va manbalar</p>
      </div>
      <ScrollArea className='flex-1'>
        <div className='space-y-4 p-4'>
          <div>
            <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
              Davr
            </p>
            <Badge variant='secondary'>2025–2026 YTD</Badge>
          </div>
          <div>
            <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
              Mahsulot
            </p>
            <Badge variant='outline'>Paxta xomashyosi</Badge>
          </div>
          <div>
            <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
              Tools
            </p>
            <ul className='text-muted-foreground space-y-1.5 text-xs'>
              <li className='flex items-center gap-2'>
                <Icons.chartBar className='text-primary size-3.5' />
                Price aggregation
              </li>
              <li className='flex items-center gap-2'>
                <Icons.risk className='text-primary size-3.5' />
                Delivery risk scan
              </li>
              <li className='flex items-center gap-2'>
                <Icons.code className='text-primary size-3.5' />
                SQL intelligence
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
              Dataset
            </p>
            <p className='text-xs leading-relaxed'>
              500 000 bitim · 6 616 shartnoma · sunʼiy test maʼlumotlari (README). Natijalar real
              UZEX bozor statistikasi emas.
            </p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

export function AiAssistantWorkspace() {
  const { messages, sendMessage, status, setMessages } = useChat<DemoUIMessage>({
    messages: initialMessages,
    // Demo transport from @shadcn/helpers; cast until AI SDK versions are aligned
    transport: chatTransport as never
  });

  const nextMessage = demoChat.next(messages);
  const isBusy = status === 'submitted' || status === 'streaming';

  return (
    <div className='relative flex min-h-[calc(100dvh-8rem)] flex-1 gap-3'>
      {/* Conversations */}
      <aside className='bg-card hidden w-56 shrink-0 flex-col overflow-hidden rounded-xl border lg:flex'>
        <div className='flex items-center justify-between border-b px-3 py-3'>
          <p className='text-sm font-medium'>Suhbatlar</p>
          <Button size='icon-sm' variant='ghost' aria-label='Yangi suhbat'>
            <Icons.add className='size-4' />
          </Button>
        </div>
        <ScrollArea className='flex-1'>
          <div className='space-y-1 p-2'>
            {conversations.map((c) => (
              <button
                key={c.id}
                type='button'
                className={cn(
                  'hover:bg-accent w-full rounded-lg px-3 py-2 text-left transition-colors',
                  c.active && 'bg-accent'
                )}
              >
                <p className='truncate text-sm font-medium'>{c.title}</p>
                <p className='text-muted-foreground truncate text-xs'>{c.preview}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main chat */}
      <div className='bg-card flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border'>
        <div className='flex shrink-0 items-center gap-2 border-b px-4 py-3'>
          <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
            <Icons.sparkles className='size-4' />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium'>UZEX Market Analyst</p>
            <p className='text-muted-foreground text-xs'>
              Scripted demo · SQL tools · manbali javob
            </p>
          </div>
          <Badge variant='outline' className='ml-auto capitalize'>
            {status}
          </Badge>
        </div>

        <MessageScrollerProvider defaultScrollPosition='end' scrollPreviousItemPeek={64}>
          <MessageScroller className='min-h-0 flex-1'>
            <MessageScrollerViewport>
              <MessageScrollerContent className='px-4 py-4'>
                {messages.length === 0 ? (
                  <div className='text-muted-foreground flex flex-1 flex-col items-center justify-center gap-4 text-center text-sm'>
                    <Icons.sparkles className='text-primary size-10' />
                    <div className='max-w-md space-y-1'>
                      <p className='text-foreground text-base font-medium'>
                        Birja bozorini so‘rang
                      </p>
                      <p>
                        Narxlar, hajm, risk va ishtirokchilar bo‘yicha tahlil. Demo uchun{' '}
                        <span className='text-foreground font-medium'>Send</span> bosing.
                      </p>
                    </div>
                    <div className='flex max-w-lg flex-wrap justify-center gap-2'>
                      {suggestedPrompts.map((prompt) => (
                        <Badge key={prompt} variant='secondary' className='max-w-full text-left'>
                          {prompt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isUser = message.role === 'user';
                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        scrollAnchor={isUser}
                      >
                        <Message align={isUser ? 'end' : 'start'}>
                          <MessageAvatar
                            className={cn(
                              'size-8 self-start',
                              isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/10 text-primary'
                            )}
                          >
                            {isUser ? (
                              <Icons.user className='size-4' />
                            ) : (
                              <Icons.sparkles className='size-4' />
                            )}
                          </MessageAvatar>
                          <MessageContent>
                            {message.parts.map((part, i) => {
                              const key = `${message.id}-${i}`;
                              if (part.type === 'text') {
                                return (
                                  <Bubble
                                    key={key}
                                    variant={isUser ? 'default' : 'muted'}
                                    align={isUser ? 'end' : 'start'}
                                  >
                                    <BubbleContent className='whitespace-pre-wrap'>
                                      {part.text}
                                    </BubbleContent>
                                  </Bubble>
                                );
                              }
                              if (part.type === 'reasoning') {
                                return (
                                  <Marker key={key}>
                                    <MarkerIcon>
                                      <Icons.sparkles />
                                    </MarkerIcon>
                                    <MarkerContent className='italic'>{part.text}</MarkerContent>
                                  </Marker>
                                );
                              }
                              if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
                                return <ToolMarker key={key} part={part as unknown as ToolPart} />;
                              }
                              return null;
                            })}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    );
                  })
                )}

                {status === 'submitted' && (
                  <MessageScrollerItem messageId='pending'>
                    <Message align='start'>
                      <MessageAvatar className='bg-primary/10 text-primary size-8 self-start'>
                        <Icons.sparkles className='size-4' />
                      </MessageAvatar>
                      <MessageContent>
                        <Marker>
                          <MarkerContent className='shimmer'>Tahlil qilinmoqda…</MarkerContent>
                        </Marker>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

        <div className='flex shrink-0 items-center gap-2 border-t px-4 py-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setMessages(demoChat.get(0))}
            disabled={isBusy || messages.length === 0}
          >
            Qayta boshlash
          </Button>
          <LoadingButton
            className='ml-auto'
            loading={isBusy}
            loadingLabel='Javob oqimi'
            disabled={!nextMessage}
            onClick={() => {
              if (nextMessage) void sendMessage(nextMessage);
            }}
          >
            {nextMessage ? (
              <>
                <Icons.send className='size-4' /> Keyingi xabar
              </>
            ) : (
              'Demo yakunlandi'
            )}
          </LoadingButton>
        </div>
      </div>

      <ContextPanel />
    </div>
  );
}
