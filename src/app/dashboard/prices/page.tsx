import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { PriceIntelligenceView } from '@/features/prices/components/price-intelligence-view';

export const metadata = { title: 'Price Intelligence' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer titleKey='pages.prices.title' descriptionKey='pages.prices.description'>
      <PriceIntelligenceView />
    </LocalizedPageContainer>
  );
}
