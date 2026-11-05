import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { RiskView } from '@/features/risk/components/risk-view';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';

export const metadata = { title: 'Risk' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer titleKey='pages.risk.title' descriptionKey='pages.risk.description'>
      <MarketDashboardBoundary>
        <RiskView />
      </MarketDashboardBoundary>
    </LocalizedPageContainer>
  );
}
