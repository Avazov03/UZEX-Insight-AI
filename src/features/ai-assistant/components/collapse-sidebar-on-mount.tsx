'use client';

import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

/** AI chat needs horizontal room — collapse nav on enter. */
export function CollapseSidebarOnMount() {
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  }, [isMobile, setOpen, setOpenMobile]);

  return null;
}
