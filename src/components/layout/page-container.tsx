import React from 'react';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';

function PageSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading page'
      className='flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6'
    >
      <div className='flex items-center justify-between'>
        <div>
          <div className='bg-muted mb-2 h-8 w-48 rounded' />
          <div className='bg-muted h-4 w-96 rounded' />
        </div>
      </div>
      <div className='bg-muted mt-6 h-40 w-full rounded-lg' />
      <div className='bg-muted h-40 w-full rounded-lg' />
    </div>
  );
}

/** Adaptive content shell: fluid on small screens, capped on ultrawide. */
const widthClass = {
  /** Tables / dashboards — roomy but not endless (~1360px) */
  default: 'mx-auto w-full max-w-[min(100%,85rem)]',
  /** Chat / reading — comfortable line length (~896px) */
  readable: 'mx-auto w-full max-w-[min(100%,56rem)]',
  /** Full bleed when intentionally needed */
  full: 'w-full'
} as const;

export type PageContentWidth = keyof typeof widthClass;

export default function PageContainer({
  children,
  isLoading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  infoContent,
  pageHeaderAction,
  contentWidth = 'default'
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
  contentWidth?: PageContentWidth;
}) {
  if (!access) {
    return (
      <div role='status' className='flex flex-1 items-center justify-center p-4 md:px-6'>
        {accessFallback ?? (
          <div className='text-muted-foreground text-center text-lg'>
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const content = isLoading ? <PageSkeleton /> : children;

  const hasHeader = pageTitle || pageHeaderAction;

  return (
    <div
      className={
        hasHeader
          ? 'flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-2 pb-4 md:px-6 md:pt-4'
          : 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-2 pb-2 md:px-6 md:pt-2'
      }
    >
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${widthClass[contentWidth]}`}
      >
        {hasHeader && (
          <div className='mb-4 flex shrink-0 items-start justify-between gap-4'>
            <Heading
              title={pageTitle ?? ''}
              description={pageDescription ?? ''}
              infoContent={infoContent}
            />
            {pageHeaderAction && <div className='shrink-0'>{pageHeaderAction}</div>}
          </div>
        )}
        {content}
      </div>
    </div>
  );
}
