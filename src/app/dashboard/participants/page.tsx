import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { ParticipantsView } from '@/features/participants/components/participants-view';

export const metadata = { title: 'Participants' };

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='Participants'
      pageDescription='Sotuvchi va xaridor ishtirokchilar tahlili.'
    >
      <ParticipantsView />
    </PageContainer>
  );
}
