import { NavGroup } from '@/types';

/**
 * UZEX Insight AI navigation
 *
 * AI Assistant is the primary workspace. Analytics modules support market
 * intelligence. Demo template routes are intentionally omitted from nav.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      {
        title: 'AI Assistant',
        url: '/dashboard/ai-assistant',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['a', 'i'],
        items: []
      }
    ]
  },
  {
    label: 'Market Intelligence',
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Market Analytics',
        url: '/dashboard/market',
        icon: 'trendingUp',
        isActive: false,
        items: []
      },
      {
        title: 'Price Intelligence',
        url: '/dashboard/prices',
        icon: 'chartBar',
        isActive: false,
        items: []
      },
      {
        title: 'Products',
        url: '/dashboard/products',
        icon: 'product',
        isActive: false,
        items: []
      },
      {
        title: 'Deals & Contracts',
        url: '/dashboard/deals',
        icon: 'fileContract',
        isActive: false,
        items: []
      },
      {
        title: 'Participants',
        url: '/dashboard/participants',
        icon: 'teams',
        isActive: false,
        items: []
      },
      {
        title: 'Brokers',
        url: '/dashboard/brokers',
        icon: 'broker',
        isActive: false,
        items: []
      },
      {
        title: 'Risk Intelligence',
        url: '/dashboard/risk',
        icon: 'risk',
        isActive: false,
        items: []
      },
      {
        title: 'Reports',
        url: '/dashboard/reports',
        icon: 'report',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'System',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Profile',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          },
          {
            title: 'Workspaces',
            url: '/dashboard/workspaces',
            icon: 'workspace'
          }
        ]
      }
    ]
  }
];
