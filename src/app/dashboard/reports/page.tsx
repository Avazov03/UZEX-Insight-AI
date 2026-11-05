import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { ReportsView } from '@/features/reports/components/reports-view';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';

export const metadata = { title: 'Reports' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer titleKey='pages.reports.title' descriptionKey='pages.reports.description'>
      <MarketDashboardBoundary>
        <ReportsView />
      </MarketDashboardBoundary>
    </LocalizedPageContainer>
  );
}
