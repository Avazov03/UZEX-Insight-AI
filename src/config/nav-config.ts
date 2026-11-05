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
  },
  {
    label: 'nav.system' satisfies MessageKey as string,
    items: [
      {
        title: 'nav.account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'nav.profile',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'nav.notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          },
          {
            title: 'nav.workspaces',
            url: '/dashboard/workspaces',
            icon: 'workspace'
          }
        ]
      }
    ]
  }
];
