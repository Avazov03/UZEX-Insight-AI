import { requireAuth } from '@/lib/auth-guard';
import { OverviewShell } from '@/features/overview/components/overview-shell';
import React from 'react';

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
    <OverviewShell
      sales={sales}
      pie_stats={pie_stats}
      bar_stats={bar_stats}
      area_stats={area_stats}
    />
  );
}
