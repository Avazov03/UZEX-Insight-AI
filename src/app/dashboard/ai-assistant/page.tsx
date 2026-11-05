import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { LiveAiChat } from '@/features/ai-assistant/components/live-ai-chat';

export const metadata = {
  title: 'AI Assistant'
};

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer contentWidth='full'>
      <LiveAiChat />
    </PageContainer>
  );
}
