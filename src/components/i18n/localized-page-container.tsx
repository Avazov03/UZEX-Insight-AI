'use client';

import PageContainer from '@/components/layout/page-container';
import type { InfobarContent } from '@/components/ui/infobar';
import { useI18n, type MessageKey } from '@/i18n';

interface LocalizedPageContainerProps {
  titleKey: MessageKey;
  descriptionKey?: MessageKey;
  children: React.ReactNode;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
  isLoading?: boolean;
}

export function LocalizedPageContainer({
  titleKey,
  descriptionKey,
  children,
  infoContent,
  pageHeaderAction,
  isLoading
}: LocalizedPageContainerProps) {
  const { t } = useI18n();

  return (
    <PageContainer
      pageTitle={t(titleKey)}
      pageDescription={descriptionKey ? t(descriptionKey) : undefined}
      infoContent={infoContent}
      pageHeaderAction={pageHeaderAction}
      isLoading={isLoading}
    >
      {children}
    </PageContainer>
  );
}
