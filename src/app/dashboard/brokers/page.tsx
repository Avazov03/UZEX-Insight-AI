import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { BrokersView } from '@/features/brokers/components/brokers-view';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Brokers' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer titleKey='pages.brokers.title' descriptionKey='pages.brokers.description'>
      <MarketDashboardBoundary>
        <BrokersView />
      </MarketDashboardBoundary>
    </LocalizedPageContainer>
  );
}
