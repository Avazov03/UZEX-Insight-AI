import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { RiskView } from '@/features/risk/components/risk-view';

export const metadata = { title: 'Risk Intelligence' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Risk Intelligence'
      pageDescription='Yetkazib berish kechikishi, bekor qilish va anomaliyalar.'
    >
      <RiskView />
    </PageContainer>
  );
}
