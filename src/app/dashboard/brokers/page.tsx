import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { BrokersView } from '@/features/brokers/components/brokers-view';

export const metadata = { title: 'Brokers' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer
      titleKey='pages.brokers.title'
      descriptionKey='pages.brokers.description'
    >
      <BrokersView />
    </LocalizedPageContainer>
  );
}
