'use client';

import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { DatasetBanner } from '@/features/shared/components/dataset-banner';
import { KpiCard } from '@/features/shared/components/kpi-card';
import { marketKpis } from '@/constants/mock-uzex';
import { formatInt, formatPct, formatTrn } from '@/lib/uzex-format';
import { useI18n } from '@/i18n';
import React from 'react';

export function OverviewShell({
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
  const { t } = useI18n();

  return (
    <LocalizedPageContainer
      titleKey='pages.overview.title'
      descriptionKey='pages.overview.description'
    >
      <div className='flex flex-1 flex-col gap-4'>
        <DatasetBanner />

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <KpiCard
            label={t('overview.totalValue')}
            value={formatTrn(marketKpis.totalValueTrn)}
            hint={t('overview.totalValueHint')}
            trend={{ value: formatPct(marketKpis.yoyValueGrowthPct), up: true }}
          />
          <KpiCard
            label={t('overview.deals')}
            value={formatInt(marketKpis.totalDeals)}
            hint={t('overview.contractsHint', { count: formatInt(marketKpis.contracts) })}
          />
          <KpiCard
            label={t('overview.participants')}
            value={formatInt(marketKpis.participants)}
            hint={t('overview.brokersHint', { count: marketKpis.brokers })}
          />
          <KpiCard
            label={t('overview.deliveryDelay')}
            value={`${marketKpis.delayRatePct}%`}
            hint={t('overview.delayedHint', { count: formatInt(marketKpis.delayedDeals) })}
            trend={{
              value: t('overview.cancelledTrend', {
                count: formatInt(marketKpis.cancelledDeals)
              }),
              up: false
            }}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 min-h-0 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </LocalizedPageContainer>
  );
}
