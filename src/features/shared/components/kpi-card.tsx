import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  trend?: { value: string; up?: boolean };
}

export function KpiCard({ label, value, hint, trend }: KpiCardProps) {
  return (
    <Card className='@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs'>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant='outline'>
              {trend.up === false ? <Icons.trendingDown /> : <Icons.trendingUp />}
              {trend.value}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className='text-muted-foreground text-sm'>{hint}</CardFooter>
    </Card>
  );
}
