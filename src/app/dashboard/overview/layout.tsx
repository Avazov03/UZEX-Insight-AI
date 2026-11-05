import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { DatasetBanner } from '@/features/shared/components/dataset-banner';
import { KpiCard } from '@/features/shared/components/kpi-card';
import { marketKpis } from '@/constants/mock-uzex';
import { formatInt, formatPct, formatTrn } from '@/lib/uzex-format';
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
    <PageContainer
      pageTitle='Market Overview'
      pageDescription='UZEX spot bozorining asosiy ko‘rsatkichlari va tendensiyalari.'
    >
      <div className='flex flex-1 flex-col gap-4'>
        <DatasetBanner />

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <KpiCard
            label='Jami bitim qiymati'
            value={formatTrn(marketKpis.totalValueTrn)}
            hint='2022 — 30.10.2026, so‘m ekvivalenti'
            trend={{ value: formatPct(marketKpis.yoyValueGrowthPct), up: true }}
          />
          <KpiCard
            label='Bitimlar'
            value={formatInt(marketKpis.totalDeals)}
            hint={`${formatInt(marketKpis.contracts)} shartnoma`}
          />
          <KpiCard
            label='Ishtirokchilar'
            value={formatInt(marketKpis.participants)}
            hint={`${marketKpis.brokers} broker`}
          />
          <KpiCard
            label='Yetkazib berish kechikishi'
            value={`${marketKpis.delayRatePct}%`}
            hint={`${formatInt(marketKpis.delayedDeals)} bitim muddatdan oshgan`}
            trend={{ value: `${formatInt(marketKpis.cancelledDeals)} bekor`, up: false }}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 min-h-0 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
