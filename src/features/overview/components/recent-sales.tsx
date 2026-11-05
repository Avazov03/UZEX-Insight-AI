'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recentDeals } from '@/constants/mock-uzex';
import { formatMln } from '@/lib/uzex-format';
import { useI18n } from '@/i18n';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status.includes('Bekor') || status.includes('kechik') || status.includes('Отмен') || status.includes('Cancel'))
    return 'destructive';
  if (status.includes('To‘liq') || status.includes('To‘langan') || status.includes('исполн') || status.includes('Paid'))
    return 'default';
  return 'secondary';
}

export function RecentSales() {
  const { t } = useI18n();
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>{t('overview.recentDeals')}</CardTitle>
        <CardDescription>{t('overview.recentDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {recentDeals.slice(0, 5).map((deal) => (
          <div key={deal.id} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 space-y-1'>
              <p className='truncate text-sm font-medium'>{deal.product}</p>
              <p className='text-muted-foreground truncate text-xs'>
                {deal.id} · {deal.region}
              </p>
            </div>
            <div className='flex shrink-0 flex-col items-end gap-1'>
              <span className='text-sm font-medium tabular-nums'>{formatMln(deal.valueMln)}</span>
              <Badge variant={statusVariant(deal.status)} className='max-w-[9rem] truncate'>
                {deal.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
