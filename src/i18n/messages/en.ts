import type { MessageTree } from './uz';

export const en: MessageTree = {
  brand: {
    name: 'UZEX Insight AI',
    tagline: 'Market Intelligence',
    quote:
      'AI-powered commodity market intelligence — analyze exchange deals, see risk, and decide with evidence.',
    hackathon: 'UZEX Hackathon'
  },
  nav: {
    workspace: 'Workspace',
    aiAssistant: 'AI Assistant',
    marketIntelligence: 'Market Intelligence',
    overview: 'Overview',
    market: 'Market Analytics',
    prices: 'Price Intelligence',
    products: 'Products',
    deals: 'Deals & Contracts',
    participants: 'Participants',
    brokers: 'Brokers',
    risk: 'Risk Intelligence',
    reports: 'Reports',
    system: 'System',
    account: 'Account',
    profile: 'Profile',
    notifications: 'Notifications',
    workspaces: 'Workspaces'
  },
  common: {
    language: 'Language',
    theme: 'Theme',
    themes: 'themes',
    search: 'Search',
    loading: 'Loading…',
    continue: 'Continue',
    signOut: 'Sign out',
    view: 'View',
    pdf: 'PDF',
    planned: 'Planned',
    inProgress: 'In progress',
    demoAnalyst: 'Demo Analyst',
    noAccess: 'You do not have access to this page.',
    datasetNote:
      'Synthetic test dataset (2022–30.10.2026). Results are not real UZEX market statistics.'
  },
  auth: {
    signInTitle: 'Sign in to UZEX Insight AI',
    welcomeBack: 'Welcome back! Please sign in to continue',
    email: 'Email address',
    emailPlaceholder: 'Enter your email address',
    password: 'Password',
    passwordPlaceholder: 'Anything works',
    bypassBadge: 'Dev bypass · any login opens the app',
    bypassHint: 'Real Clerk Google / email auth will be connected later.'
  },
  pages: {
    aiAssistant: {
      title: 'AI Assistant',
      description: 'Ask about the exchange market in plain language — analysis, risk, and sources.'
    },
    overview: {
      title: 'Market Overview',
      description: 'Key UZEX spot market indicators and trends.'
    },
    market: {
      title: 'Market Analytics',
      description: 'Trade volume, categories, and deal statuses.'
    },
    prices: {
      title: 'Price Intelligence',
      description: 'Commodity price dynamics and regional differences.'
    },
    products: {
      title: 'Products',
      description: 'Product catalog and name normalization.'
    },
    deals: {
      title: 'Deals & Contracts',
      description: 'Deals, contracts, and fulfillment statuses.'
    },
    participants: {
      title: 'Participants',
      description: 'Seller and buyer participant analysis.'
    },
    brokers: {
      title: 'Brokers',
      description: 'Trading and risk metrics by broker.'
    },
    risk: {
      title: 'Risk Intelligence',
      description: 'Delivery delays, cancellations, and anomalies.'
    },
    reports: {
      title: 'Reports',
      description: 'Automated analytical reports and export.'
    }
  },
  overview: {
    totalValue: 'Total deal value',
    totalValueHint: '2022 — 30.10.2026, UZS equivalent',
    deals: 'Deals',
    contractsHint: '{count} contracts',
    participants: 'Participants',
    brokersHint: '{count} brokers',
    deliveryDelay: 'Delivery delay',
    delayedHint: '{count} deals past deadline',
    cancelledTrend: '{count} cancelled',
    trend2026: '2026 trade dynamics',
    trendDesc: 'January — October, trillion UZS',
    yearlyVolume: 'Yearly volume',
    yearlyDesc: 'Deal count and value (trillion UZS)',
    categoryShare: 'Category share',
    categoryDesc: 'Value distribution (%)',
    recentDeals: 'Recent deals',
    recentDesc: 'Sample records · test dataset'
  },
  market: {
    agriShare: 'Agriculture share',
    agriHint: 'Largest category by value',
    ytdValue: '2026 YTD value',
    ytdHint: '+21.1% vs same period 2025',
    contracts: 'Contracts',
    contractsHint: 'Active trade chain',
    byCategory: 'Value by category',
    byCategoryDesc: 'Share (%) and approx. trillion UZS',
    dealStatuses: 'Deal statuses',
    asOf: 'As of 30.10.2026',
    status: 'Status',
    count: 'Count'
  },
  prices: {
    cottonAvg: 'Cotton average',
    cottonHint: 'Oct 2026 · UZS/t equiv.',
    yoy: 'YoY growth',
    yoyHint: 'Raw cotton · vs 2025 YTD',
    topRegion: 'Highest-price region',
    topRegionHint: 'Cotton avg 19.2 mln',
    dynamics: 'Price dynamics',
    dynamicsDesc: 'Key commodities · mln UZS (index)',
    regional: 'Regional prices',
    regionalDesc: 'Average price and deal count',
    region: 'Region',
    product: 'Product',
    avgMln: 'Avg (mln)',
    deals: 'Deals'
  },
  products: {
    core: 'Core products',
    coreHint: 'Canonical names (normalization)',
    variants: 'Name variants',
    variantsHint: 'Spelling diversity in deals',
    topCategory: 'Top category',
    topCategoryHint: '~52% of value',
    catalog: 'Product catalog',
    catalogDesc: 'Name normalization keeps brand / grade / size',
    product: 'Product',
    category: 'Category',
    variantCount: 'Variants',
    deals: 'Deals',
    value: 'Value'
  },
  deals: {
    total: 'Total deals',
    uniqueId: 'Unique ID',
    cancelled: 'Cancelled',
    riskMonitor: 'Risk monitoring',
    partial: 'Partially fulfilled',
    partialHint: 'Avg delivered ~60.9%',
    delay: 'Delay',
    delayHint: '{pct}% deadline breach',
    tableTitle: 'Deals & contracts',
    tableDesc: 'Latest sample deals',
    deal: 'Deal',
    product: 'Product',
    region: 'Region',
    date: 'Date',
    status: 'Status',
    value: 'Value'
  },
  participants: {
    total: 'Participants',
    totalHint: 'Seller and buyer STINs',
    topSeller: 'Top seller',
    topBuyer: 'Top buyer',
    tableTitle: 'Participant analysis',
    tableDesc: 'Most active participants (sample)',
    name: 'Name',
    role: 'Role',
    region: 'Region',
    deals: 'Deals',
    value: 'Value',
    seller: 'Seller',
    buyer: 'Buyer'
  },
  brokers: {
    total: 'Brokers',
    totalHint: 'Brokers in registry',
    highestCancel: 'Highest cancellations',
    highestCancelHint: '1,450 cancelled deals',
    lowestDelay: 'Lowest delay',
    lowestDelayHint: '2.4% delay rate',
    ranking: 'Broker ranking',
    rankingDesc: 'Volume, cancellations, and delays',
    broker: 'Broker',
    deals: 'Deals',
    cancelled: 'Cancelled',
    delayPct: 'Delay %',
    sharePct: 'Share %'
  },
  risk: {
    delayRate: 'Delay rate',
    delayHint: '{count} deals',
    monitoring: 'Monitoring',
    cancelled: 'Cancelled',
    cancelledHint: 'Check by broker / product',
    partial: 'Partially fulfilled',
    partialHint: 'Avg delivered ~60.9%'
  },
  ai: {
    conversations: 'Conversations',
    newChat: 'New chat',
    analyst: 'UZEX Market Analyst',
    analystHint: 'Live AI · PostgreSQL analytics · sourced answers',
    askMarket: 'Ask something',
    askHint: 'Ask about prices, volume, risk, and participants.',
    analyzing: 'Analyzing…',
    send: 'Send',
    ready: 'ready',
    enterHint: 'Enter — send · Shift+Enter — new line',
    emptyReply: 'No reply. Please try again.',
    restart: 'Restart',
    nextMessage: 'Next message',
    demoEnded: 'Demo finished',
    streaming: 'Streaming response',
    context: 'Analysis context',
    contextHint: 'Current query filters and sources',
    period: 'Period',
    product: 'Product',
    tools: 'Tools',
    toolOverview: 'Market overview',
    toolPrices: 'Product prices',
    toolRisk: 'Delivery risk',
    toolCompare: 'Year compare',
    dataset: 'Dataset',
    datasetBody:
      '500,000 deals · 6,616 contracts · synthetic test data (README). Not real UZEX statistics.'
  }
};
