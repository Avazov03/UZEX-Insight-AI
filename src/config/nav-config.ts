import { NavGroup } from '@/types';
import type { MessageKey } from '@/i18n';

/**
 * UZEX Insight AI navigation — `title` holds i18n message keys.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'nav.workspace' satisfies MessageKey as string,
    items: [
      {
        title: 'nav.aiAssistant',
        url: '/dashboard/ai-assistant',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['a', 'i'],
        items: []
      }
    ]
  },
  {
    label: 'nav.marketIntelligence' satisfies MessageKey as string,
    items: [
      {
        title: 'nav.overview',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'nav.market',
        url: '/dashboard/market',
        icon: 'trendingUp',
        isActive: false,
        items: []
      },
      {
        title: 'nav.prices',
        url: '/dashboard/prices',
        icon: 'chartBar',
        isActive: false,
        items: []
      },
      {
        title: 'nav.products',
        url: '/dashboard/products',
        icon: 'product',
        isActive: false,
        items: []
      },
      {
        title: 'nav.deals',
        url: '/dashboard/deals',
        icon: 'fileContract',
        isActive: false,
        items: []
      },
      {
        title: 'nav.participants',
        url: '/dashboard/participants',
        icon: 'teams',
        isActive: false,
        items: []
      },
      {
        title: 'nav.brokers',
        url: '/dashboard/brokers',
        icon: 'broker',
        isActive: false,
        items: []
      },
      {
        title: 'nav.risk',
        url: '/dashboard/risk',
        icon: 'risk',
        isActive: false,
        items: []
      },
      {
        title: 'nav.reports',
        url: '/dashboard/reports',
        icon: 'report',
        isActive: false,
        items: []
      }
    ]
  }
  // Hisob / Profil / Bildirishnomalar / Ish maydonlari — yashirilgan (saralash UX).
  // Kod marshrutlari saqlangan; kerak bo‘lsa shu yerga qayta qo‘shiladi.
];
