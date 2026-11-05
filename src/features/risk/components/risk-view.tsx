import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatasetBanner } from '@/features/shared/components/dataset-banner';
import { KpiCard } from '@/features/shared/components/kpi-card';
import { marketKpis, riskAlerts } from '@/constants/mock-uzex';
import { formatInt } from '@/lib/uzex-format';
import { Icons } from '@/components/icons';

export function RiskView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Kechikish darajasi'
          value={`${marketKpis.delayRatePct}%`}
          hint={`${formatInt(marketKpis.delayedDeals)} bitim`}
          trend={{ value: 'Monitoring', up: false }}
        />
        <KpiCard
          label='Bekor qilingan'
          value={formatInt(marketKpis.cancelledDeals)}
          hint='Broker / mahsulot kesimida tekshirish'
        />
        <KpiCard
          label='Qisman bajarilgan'
          value={formatInt(marketKpis.partialDeals)}
          hint='O‘rtacha yetkazilgan ~60.9%'
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
