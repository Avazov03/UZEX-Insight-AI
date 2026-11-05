import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { DealsView } from '@/features/deals/components/deals-view';

export const metadata = { title: 'Deals & Contracts' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer titleKey='pages.deals.title' descriptionKey='pages.deals.description'>
      <DealsView />
    </LocalizedPageContainer>
  );
}
