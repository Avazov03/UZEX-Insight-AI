import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { MarketAnalyticsView } from '@/features/market/components/market-analytics-view';

export const metadata = { title: 'Market Analytics' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Market Analytics'
      pageDescription='Savdo hajmi, kategoriyalar va bitim holatlari.'
    >
      <MarketAnalyticsView />
    </PageContainer>
  );
}
