import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { ProductsCatalogView } from '@/features/products/components/products-catalog-view';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer
      titleKey='pages.products.title'
      descriptionKey='pages.products.description'
    >
      <MarketDashboardBoundary>
        <ProductsCatalogView />
      </MarketDashboardBoundary>
    </LocalizedPageContainer>
  );
}
