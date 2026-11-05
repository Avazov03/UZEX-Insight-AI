import { requireAuth } from '@/lib/auth-guard';
import PageContainer from '@/components/layout/page-container';
import { AiAssistantWorkspace } from '@/features/ai-assistant/components/ai-assistant-workspace';

export const metadata = {
  title: 'AI Assistant'
};

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer
      pageTitle='AI Assistant'
      pageDescription='Birja bozorini oddiy tilda so‘rang — tahlil, risk va manbali javoblar.'
    >
      <AiAssistantWorkspace />
    </PageContainer>
  );
}
