import { dehydrate, HydrationBoundary, noop } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { marketQueries } from '../api/queries';
import { Skeleton } from '@/components/ui/skeleton';

function MarketDashboardFallback() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <Skeleton className='h-10 w-full' />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Skeleton className='h-28' />
        <Skeleton className='h-28' />
        <Skeleton className='h-28' />
      </div>
      <Skeleton className='h-72 w-full' />
    </div>
  );
}

export function MarketDashboardBoundary({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  void queryClient.query(marketQueries.dashboard()).catch(noop);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MarketDashboardFallback />}>{children}</Suspense>
    </HydrationBoundary>
  );
}
