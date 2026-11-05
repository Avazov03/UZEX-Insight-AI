/** Core dashboard routes and expected Uzbek page titles. */
export const CORE_PAGES = [
  { path: '/dashboard/ai-assistant', title: 'AI Yordamchi' },
  { path: '/dashboard/overview', title: 'Bozor ko‘rinishi' },
  { path: '/dashboard/market', title: 'Bozor tahlili' },
  { path: '/dashboard/prices', title: 'Narx intelligence' },
  { path: '/dashboard/products', title: 'Mahsulotlar' },
  { path: '/dashboard/deals', title: 'Bitimlar va shartnomalar' },
  { path: '/dashboard/participants', title: 'Ishtirokchilar' },
  { path: '/dashboard/brokers', title: 'Brokerlar' },
  { path: '/dashboard/risk', title: 'Risk intelligence' },
  { path: '/dashboard/reports', title: 'Hisobotlar' }
] as const;
