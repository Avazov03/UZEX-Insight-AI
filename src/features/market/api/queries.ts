import { queryOptions } from '@tanstack/react-query';
import { fetchMarketDashboard } from './service';

export const marketQueries = {
  all: () => ['market'] as const,
  dashboard: () =>
    queryOptions({
      queryKey: [...marketQueries.all(), 'dashboard'] as const,
      queryFn: () => fetchMarketDashboard(),
      // Mirror server TTL — dataset is static import, safe to keep warm
      staleTime: 10 * 60_000,
      gcTime: 30 * 60_000
    })
};
