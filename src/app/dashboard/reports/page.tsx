import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { ReportsView } from '@/features/reports/components/reports-view';

export const metadata = { title: 'Reports' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Reports'
      pageDescription='Avtomatik tahliliy hisobotlar va eksport.'
    >
      <ReportsView />
    </PageContainer>
  );
}
