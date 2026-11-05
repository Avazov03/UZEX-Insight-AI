import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { ParticipantsView } from '@/features/participants/components/participants-view';
import { MarketDashboardBoundary } from '@/features/market/components/market-dashboard-boundary';

export const metadata = { title: 'Participants' };

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer
      titleKey='pages.participants.title'
      descriptionKey='pages.participants.description'
    >
      <MarketDashboardBoundary>
        <ParticipantsView />
      </MarketDashboardBoundary>
    </LocalizedPageContainer>
  );
}
