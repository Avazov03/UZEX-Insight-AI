import { requireAuth } from '@/lib/auth-guard';
import { OverviewShell } from '@/features/overview/components/overview-shell';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  await requireAuth();

  return (
    <MarketDashboardBoundary>
      <OverviewShell
        sales={sales}
        pie_stats={pie_stats}
        bar_stats={bar_stats}
        area_stats={area_stats}
      />
    </MarketDashboardBoundary>
  );
}
