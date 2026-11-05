import { queryOptions } from '@tanstack/react-query';
import { fetchMarketDashboard } from './service';

export const marketQueries = {
  all: () => ['market'] as const,
  dashboard: () =>
    queryOptions({
      queryKey: [...marketQueries.all(), 'dashboard'] as const,
      queryFn: () => fetchMarketDashboard(),
      staleTime: 60_000
    })
};
