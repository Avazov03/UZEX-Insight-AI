import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { MarketAnalyticsView } from '@/features/market/components/market-analytics-view';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';

export const metadata = { title: 'Market Analytics' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer titleKey='pages.market.title' descriptionKey='pages.market.description'>
      <MarketDashboardBoundary>
        <MarketAnalyticsView />
      </MarketDashboardBoundary>
    </LocalizedPageContainer>
  );
}
