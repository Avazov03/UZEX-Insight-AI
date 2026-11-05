import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { BrokersView } from '@/features/brokers/components/brokers-view';

export const metadata = { title: 'Brokers' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Brokers'
      pageDescription='Brokerlar kesimida savdo va risk ko‘rsatkichlari.'
    >
      <BrokersView />
    </PageContainer>
  );
}
