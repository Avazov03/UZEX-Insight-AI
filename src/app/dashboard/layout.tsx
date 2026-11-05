import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAuth } from '@/lib/auth-guard';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'UZEX Insight AI',
  description: 'AI-powered commodity market intelligence for UZEX',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: every /dashboard page also calls auth.protect() itself,
  // because layouts don't always re-render when pages do (Clerk guidance).
  await requireAuth();
  // Sidebar starts open; user toggle is persisted in cookie.
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebar_state')?.value;
  const defaultOpen = sidebarCookie === undefined ? true : sidebarCookie === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <a
          href='#main-content'
          className='bg-background ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:ring-2'
        >
          Skip to content
        </a>
        <AppSidebar />
        <SidebarInset
          id='main-content'
          tabIndex={-1}
          className='scroll-mt-16 min-h-0 flex-1 overflow-hidden'
        >
          <Header />
          <InfobarProvider defaultOpen={false} className='min-h-0 flex-1 overflow-hidden'>
            <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
              {children}
            </div>
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
