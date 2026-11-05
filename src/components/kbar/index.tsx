'use client';
import { navGroups } from '@/config/nav-config';
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from 'kbar';
import { Kbd } from '@/components/ui/kbd';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { useI18n, type MessageKey } from '@/i18n';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  const filteredGroups = useFilteredNavGroups(navGroups);

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    const allItems = filteredGroups.flatMap((group) => group.items);
    const navSection = t('kbar.navigation');

    return allItems.flatMap((navItem) => {
      const label = t(navItem.title as MessageKey);
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: label,
              shortcut: navItem.shortcut,
              keywords: `${label} ${navItem.title}`.toLowerCase(),
              section: navSection,
              subtitle: t('kbar.goTo', { page: label }),
              perform: () => navigateTo(navItem.url)
            }
          : null;

      const childActions =
        navItem.items?.map((childItem) => {
          const childLabel = t(childItem.title as MessageKey);
          return {
            id: `${childItem.title.toLowerCase()}Action`,
            name: childLabel,
            shortcut: childItem.shortcut,
            keywords: `${childLabel} ${childItem.title}`.toLowerCase(),
            section: label,
            subtitle: t('kbar.goTo', { page: childLabel }),
            perform: () => navigateTo(childItem.url)
          };
        }) ?? [];

      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, filteredGroups, t]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

function KBarComponent({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-black/10 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-99999 flex items-start! justify-center p-4! pt-[14vh]!'>
          <KBarAnimator className='bg-popover text-popover-foreground ring-foreground/10 relative mx-auto w-full max-w-[600px] overflow-hidden rounded-xl shadow-lg ring-1'>
            <div className='bg-popover sticky top-0 z-10 border-b'>
              <KBarSearch
                defaultPlaceholder={t('kbar.placeholder')}
                className='placeholder:text-muted-foreground w-full border-none bg-transparent px-4 py-3.5 text-sm outline-hidden focus:ring-0 focus:outline-hidden'
              />
            </div>
            <div className='h-[400px]'>
              <RenderResults />
            </div>
            <div className='text-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-xs'>
              <span className='flex items-center gap-1'>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> {t('kbar.navigate')}
              </span>
              <span className='flex items-center gap-1'>
                <Kbd>↵</Kbd> {t('kbar.open')}
              </span>
              <span className='flex items-center gap-1'>
                <Kbd>esc</Kbd> {t('kbar.close')}
              </span>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
}
