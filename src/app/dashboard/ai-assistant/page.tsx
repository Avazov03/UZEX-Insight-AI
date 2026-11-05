import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { AiAssistantWorkspace } from '@/features/ai-assistant/components/ai-assistant-workspace';

export const metadata = {
  title: 'AI Assistant'
};

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer
      titleKey='pages.aiAssistant.title'
      descriptionKey='pages.aiAssistant.description'
    >
      <AiAssistantWorkspace />
    </LocalizedPageContainer>
  );
}
