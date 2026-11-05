'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navGroups } from '@/config/nav-config';
import { useClerk, useUser } from '@clerk/nextjs';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import type { NavItem } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { useI18n, type MessageKey } from '@/i18n';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { t } = useI18n();
  const filteredGroups = useFilteredNavGroups(navGroups);
  const bypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
  const displayUser = user
    ? user
    : bypass
      ? {
          fullName: t('common.demoAnalyst'),
          imageUrl: '',
          emailAddresses: [{ emailAddress: 'analyst@uzex.local' }]
        }
      : null;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && (
              <SidebarGroupLabel>{t(group.label as MessageKey)}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => (
                <NavMainItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size='lg'
                    className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
                  />
                }
              >
                {displayUser && (
                  <UserAvatarProfile className='h-8 w-8 rounded-lg' showInfo user={displayUser} />
                )}
                <Icons.chevronsDown className='ml-auto size-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--anchor-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='px-1 py-1.5'>
                      {displayUser && (
                        <UserAvatarProfile
                          className='h-8 w-8 rounded-lg'
                          showInfo
                          user={displayUser}
                        />
                      )}
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <Icons.account className='mr-2 h-4 w-4' />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/ai-assistant')}>
                    <Icons.sparkles className='mr-2 h-4 w-4' />
                    {t('nav.aiAssistant')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                    <Icons.notification className='mr-2 h-4 w-4' />
                    {t('nav.notifications')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      if (bypass) {
                        router.push('/auth/sign-in');
                        return;
                      }
                      void signOut({ redirectUrl: '/auth/sign-in' });
                    }}
                  >
                    <Icons.logout aria-hidden className='mr-2 h-4 w-4' />
                    {t('common.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function isActivePath(pathname: string, url: string) {
  return pathname === url || (url !== '/' && pathname.startsWith(`${url}/`));
}

function NavMainItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { state, isMobile } = useSidebar();
  const { t } = useI18n();
  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
  const children = item.items ?? [];
  const label = t(item.title as MessageKey);

  if (children.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.url} aria-label={label} />}
          tooltip={label}
          isActive={pathname === item.url}
        >
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const hasActiveChild = children.some((child) => isActivePath(pathname, child.url));

  // The icon rail hides sub-items, so a group opens its links in a menu to the right instead
  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip={label}
                isActive={hasActiveChild}
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
              />
            }
          >
            <Icon />
            <span>{label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side='right'
            align='start'
            sideOffset={8}
            className='w-auto min-w-48'
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {children.map((child) => {
                const ChildIcon = child.icon ? Icons[child.icon] : null;
                const active = isActivePath(pathname, child.url);
                const childLabel = t(child.title as MessageKey);
                return (
                  <DropdownMenuItem
                    key={child.title}
                    render={
                      <Link
                        href={child.url}
                        aria-label={childLabel}
                        aria-current={active ? 'page' : undefined}
                      />
                    }
                    className={active ? 'bg-accent text-accent-foreground font-medium' : undefined}
                  >
                    {ChildIcon && <ChildIcon />}
                    {childLabel}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={item.isActive || hasActiveChild} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={label}
            isActive={pathname === item.url}
            className='group/collapsible'
          />
        }
      >
        {item.icon && <Icon />}
        <span>{label}</span>
        <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-panel-open/collapsible:rotate-90' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {children.map((child) => {
            const childLabel = t(child.title as MessageKey);
            return (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton
                  render={<Link href={child.url} aria-label={childLabel} />}
                  isActive={pathname === child.url}
                >
                  <span>{childLabel}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
