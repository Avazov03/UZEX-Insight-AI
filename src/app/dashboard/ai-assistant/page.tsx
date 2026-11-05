import { requireAuth } from '@/lib/auth-guard';
import { LocalizedPageContainer } from '@/components/i18n/localized-page-container';
import { LiveAiChat } from '@/features/ai-assistant/components/live-ai-chat';
import { CollapseSidebarOnMount } from '@/features/ai-assistant/components/collapse-sidebar-on-mount';

export const metadata = {
  title: 'AI Assistant'
};

export default async function Page() {
  await requireAuth();

  return (
    <LocalizedPageContainer
      titleKey='pages.aiAssistant.title'
      descriptionKey='pages.aiAssistant.description'
      contentWidth='readable'
    >
      <CollapseSidebarOnMount />
      <LiveAiChat />
    </LocalizedPageContainer>
  );
}
