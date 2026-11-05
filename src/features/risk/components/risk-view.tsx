'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatasetBanner } from '@/features/shared/components/dataset-banner';
import { KpiCard } from '@/features/shared/components/kpi-card';
import { useMarketDashboard } from '@/features/market/hooks/use-market-dashboard';
import { formatInt } from '@/lib/uzex-format';
import { Icons } from '@/components/icons';

export function RiskView() {
  const { data } = useMarketDashboard();
  const { kpis, riskAlerts, datasetNote } = data;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Kechikish darajasi'
          value={`${kpis.delayRatePct}%`}
          hint={`${formatInt(kpis.delayedDeals)} bitim`}
          trend={{ value: 'Monitoring', up: false }}
        />
        <KpiCard
          label='Bekor qilingan'
          value={formatInt(kpis.cancelledDeals)}
          hint='Broker / mahsulot kesimida tekshirish'
        />
        <KpiCard
          label='Qisman bajarilgan'
          value={formatInt(kpis.partialDeals)}
          hint={`O‘rtacha yetkazilgan ~${kpis.avgDeliveredPct}%`}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {riskAlerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className='flex items-start justify-between gap-2'>
                <CardTitle className='text-base'>{alert.title}</CardTitle>
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </div>
              <CardDescription>{alert.category}</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground flex items-start gap-2 text-sm'>
              <Icons.warning className='text-primary mt-0.5 size-4 shrink-0' />
              <p>{alert.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
