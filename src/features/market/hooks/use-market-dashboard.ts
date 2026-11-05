'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { marketQueries } from '../api/queries';

export function useMarketDashboard() {
  return useSuspenseQuery(marketQueries.dashboard());
}
