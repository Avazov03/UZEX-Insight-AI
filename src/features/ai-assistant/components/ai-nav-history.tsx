'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  ACTIVE_THREAD_EVENT,
  THREADS_EVENT,
  createThread,
  getActiveThreadId,
  loadThreads,
  setActiveThreadId,
  sortThreads,
  updateStoredThreads,
  type ChatThread
} from '../lib/chat-store';

const AI_URL = '/dashboard/ai-assistant';
/** ~6 qator: har biri ~36px */
const HISTORY_MAX_H = '13.5rem';

export function AiNavHistory() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const onAiPage = pathname === AI_URL || pathname.startsWith(`${AI_URL}/`);
  const [open, setOpen] = useState(onAiPage);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  function refresh() {
    setThreads(sortThreads(loadThreads()));
    setActiveId(getActiveThreadId());
  }

  useEffect(() => {
    refresh();
    const onThreads = () => refresh();
    const onActive = (e: Event) => {
      const id = (e as CustomEvent<{ id: string | null }>).detail?.id ?? getActiveThreadId();
      setActiveId(id);
    };
    window.addEventListener(THREADS_EVENT, onThreads);
    window.addEventListener(ACTIVE_THREAD_EVENT, onActive);
    window.addEventListener('storage', onThreads);
    return () => {
      window.removeEventListener(THREADS_EVENT, onThreads);
      window.removeEventListener(ACTIVE_THREAD_EVENT, onActive);
      window.removeEventListener('storage', onThreads);
    };
  }, []);

  useEffect(() => {
    if (onAiPage) setOpen(true);
  }, [onAiPage]);

  const collapsedRail = state === 'collapsed' && !isMobile;

  function selectThread(id: string) {
    setActiveThreadId(id);
    setActiveId(id);
    if (!onAiPage) router.push(AI_URL);
    if (isMobile) setOpenMobile(false);
  }

  function newChat() {
    const fresh = createThread();
    setActiveThreadId(fresh.id);
    setActiveId(fresh.id);
    window.dispatchEvent(
      new CustomEvent('uzex-ai-new-chat', { detail: { id: fresh.id } })
    );
    if (!onAiPage) router.push(AI_URL);
    if (isMobile) setOpenMobile(false);
  }

  function togglePin(id: string) {
    updateStoredThreads((list) =>
      sortThreads(
        list.map((t) =>
          t.id === id ? { ...t, pinned: !t.pinned, updatedAt: Date.now() } : t
        )
      )
    );
    refresh();
  }

  function deleteThread(id: string) {
    if (!window.confirm(t('ai.deleteConfirm'))) return;
    updateStoredThreads((list) => list.filter((t) => t.id !== id));
    if (activeId === id) {
      const next = loadThreads()[0];
      setActiveThreadId(next?.id ?? null);
    }
    refresh();
  }

  function commitRename() {
    if (!renamingId) return;
    const title = renameDraft.trim();
    updateStoredThreads((list) =>
      list.map((t) =>
        t.id === renamingId
          ? { ...t, title: title || t.title, updatedAt: Date.now() }
          : t
      )
    );
    setRenamingId(null);
    setRenameDraft('');
    refresh();
  }

  if (collapsedRail) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={AI_URL} aria-label={t('nav.aiAssistant')} />}
          tooltip={t('nav.aiAssistant')}
          isActive={onAiPage}
        >
          <Icons.sparkles />
          <span>{t('nav.aiAssistant')}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type='button'
        isActive={onAiPage}
        className='data-[active=true]:font-medium'
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (!onAiPage) router.push(AI_URL);
        }}
        data-testid='ai-workspace-toggle'
        aria-expanded={open}
      >
        <Icons.sparkles />
        <span>{t('nav.aiAssistant')}</span>
        <Icons.chevronDown
          className={cn(
            'ml-auto size-4 transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </SidebarMenuButton>

      <div
        data-testid='ai-history'
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className='px-2 pt-1 pb-2'>
          <button
            type='button'
            data-testid='ai-new-chat'
            onClick={newChat}
            className='text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs'
          >
            <Icons.add className='size-3.5' />
            {t('ai.newChat')}
          </button>

          {!threads.length ? (
            <p className='text-sidebar-foreground/50 px-2 py-3 text-center text-[11px]'>
              {t('ai.emptyHistory')}
            </p>
          ) : (
            <>
              <p className='text-sidebar-foreground/50 px-2 pb-1 text-[10px] font-medium tracking-wide uppercase'>
                {t('ai.recent')}
              </p>
              <SidebarMenuSub
                className='mx-0 border-0 px-0'
                style={{ maxHeight: HISTORY_MAX_H, overflowY: 'auto' }}
              >
                {threads.map((thread) => {
                  const title = thread.title || t('ai.untitled');
                  const active = thread.id === activeId;
                  if (renamingId === thread.id) {
                    return (
                      <SidebarMenuSubItem key={thread.id} className='px-1'>
                        <Input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitRename();
                            }
                            if (e.key === 'Escape') {
                              setRenamingId(null);
                              setRenameDraft('');
                            }
                          }}
                          className='h-7 text-xs'
                          aria-label={t('ai.rename')}
                        />
                      </SidebarMenuSubItem>
                    );
                  }
                  return (
                    <SidebarMenuSubItem key={thread.id} className='group/thread relative'>
                      <SidebarMenuSubButton
                        size='sm'
                        isActive={active}
                        className='pr-7'
                        onClick={() => selectThread(thread.id)}
                        data-testid={`ai-thread-${thread.id}`}
                      >
                        {thread.pinned ? (
                          <Icons.pinned className='size-3.5 shrink-0 opacity-70' />
                        ) : (
                          <Icons.chat className='size-3.5 shrink-0 opacity-70' />
                        )}
                        <span className='truncate'>{title}</span>
                      </SidebarMenuSubButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type='button'
                              size='icon-sm'
                              variant='ghost'
                              className='absolute top-0.5 right-0 size-6 opacity-100 md:opacity-0 md:group-hover/thread:opacity-100'
                              aria-label={t('ai.conversations')}
                            />
                          }
                        >
                          <Icons.ellipsis className='size-3.5' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-40'>
                          <DropdownMenuItem onClick={() => togglePin(thread.id)}>
                            {thread.pinned ? (
                              <>
                                <Icons.pin className='size-3.5' />
                                {t('ai.unpin')}
                              </>
                            ) : (
                              <>
                                <Icons.pinned className='size-3.5' />
                                {t('ai.pin')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRenamingId(thread.id);
                              setRenameDraft(thread.title || '');
                            }}
                          >
                            <Icons.edit className='size-3.5' />
                            {t('ai.rename')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant='destructive'
                            onClick={() => deleteThread(thread.id)}
                          >
                            <Icons.trash className='size-3.5' />
                            {t('ai.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </>
          )}
        </div>
      </div>
    </SidebarMenuItem>
  );
}
