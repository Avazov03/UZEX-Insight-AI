import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { PriceIntelligenceView } from '@/features/prices/components/price-intelligence-view';

export const metadata = { title: 'Price Intelligence' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Price Intelligence'
      pageDescription='Tovar narxlari dinamikasi va hududiy farqlar.'
    >
      <PriceIntelligenceView />
    </PageContainer>
  );
}
