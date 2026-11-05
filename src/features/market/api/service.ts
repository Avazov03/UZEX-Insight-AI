'use server';

import { getMarketDashboard } from '@/lib/uzex-dashboard';
import type { MarketDashboard } from './types';

/** Server-only data access — swap here if backend moves off Postgres. */
export async function fetchMarketDashboard(): Promise<MarketDashboard> {
  return getMarketDashboard();
}
