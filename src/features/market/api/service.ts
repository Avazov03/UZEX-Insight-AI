'use server';

import snapshot from '@/constants/market-dashboard-snapshot.json';
import type { MarketDashboard } from './types';

/**
 * Diagram/KPI pages use a frozen snapshot of the real Postgres aggregates.
 * AI chat keeps querying Postgres via uzex-analytics — do not wire it here.
 */
export async function fetchMarketDashboard(): Promise<MarketDashboard> {
  return snapshot as MarketDashboard;
}
