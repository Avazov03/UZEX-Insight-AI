import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { DealsView } from '@/features/deals/components/deals-view';

export const metadata = { title: 'Deals & Contracts' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Deals & Contracts'
      pageDescription='Bitimlar, shartnomalar va bajarilish holatlari.'
    >
      <DealsView />
    </PageContainer>
  );
}
