import type { MessageTree } from './uz';

export const ru: MessageTree = {
  brand: {
    name: 'UZEX Insight AI',
    tagline: 'Market Intelligence',
    quote:
      'AI-аналитика товарного рынка — анализируйте сделки биржи, видьте риски и принимайте решения.',
    hackathon: 'UZEX Hackathon'
  },
  nav: {
    workspace: 'Рабочая область',
    aiAssistant: 'AI-ассистент',
    marketIntelligence: 'Рыночная аналитика',
    overview: 'Обзор',
    market: 'Анализ рынка',
    prices: 'Ценовая аналитика',
    products: 'Продукты',
    deals: 'Сделки и контракты',
    participants: 'Участники',
    brokers: 'Брокеры',
    risk: 'Риск-аналитика',
    reports: 'Отчёты',
    system: 'Система',
    account: 'Аккаунт',
    profile: 'Профиль',
    notifications: 'Уведомления',
    workspaces: 'Рабочие пространства'
  },
  common: {
    language: 'Язык',
    theme: 'Тема',
    themes: 'темы',
    search: 'Поиск',
    loading: 'Загрузка…',
    continue: 'Продолжить',
    signOut: 'Выйти',
    view: 'Открыть',
    pdf: 'PDF',
    planned: 'Запланировано',
    inProgress: 'В работе',
    demoAnalyst: 'Demo Analyst',
    noAccess: 'У вас нет доступа к этой странице.',
    datasetNote:
      'Синтетический тестовый датасет (2022–30.10.2026). Результаты не являются реальной статистикой UZEX.'
  },
  auth: {
    signInTitle: 'Вход в UZEX Insight AI',
    welcomeBack: 'С возвращением! Войдите, чтобы продолжить',
    email: 'Адрес email',
    emailPlaceholder: 'Введите email',
    password: 'Пароль',
    passwordPlaceholder: 'Подойдёт любой пароль',
    bypassBadge: 'Dev bypass · любой логин открывает доступ',
    bypassHint: 'Позже подключим настоящую авторизацию Clerk через Google / email.'
  },
  pages: {
    aiAssistant: {
      title: 'AI-ассистент',
      description: 'Спрашивайте о рынке биржи простым языком — анализ, риски и источники.'
    },
    overview: {
      title: 'Обзор рынка',
      description: 'Ключевые показатели и тенденции спотового рынка UZEX.'
    },
    market: {
      title: 'Анализ рынка',
      description: 'Объёмы торгов, категории и статусы сделок.'
    },
    prices: {
      title: 'Ценовая аналитика',
      description: 'Динамика цен на товары и региональные различия.'
    },
    products: {
      title: 'Продукты',
      description: 'Каталог товаров и нормализация наименований.'
    },
    deals: {
      title: 'Сделки и контракты',
      description: 'Сделки, контракты и статусы исполнения.'
    },
    participants: {
      title: 'Участники',
      description: 'Анализ продавцов и покупателей.'
    },
    brokers: {
      title: 'Брокеры',
      description: 'Торговля и риски в разрезе брокеров.'
    },
    risk: {
      title: 'Риск-аналитика',
      description: 'Просрочки поставки, отмены и аномалии.'
    },
    reports: {
      title: 'Отчёты',
      description: 'Автоматические аналитические отчёты и экспорт.'
    }
  },
  overview: {
    totalValue: 'Общая стоимость сделок',
    totalValueHint: '2022 — 30.10.2026, эквивалент в сумах',
    deals: 'Сделки',
    contractsHint: '{count} контрактов',
    participants: 'Участники',
    brokersHint: '{count} брокеров',
    deliveryDelay: 'Просрочка поставки',
    delayedHint: '{count} сделок с нарушением срока',
    cancelledTrend: '{count} отмен',
    trend2026: 'Динамика торгов 2026',
    trendDesc: 'Январь — октябрь, трлн сум',
    yearlyVolume: 'Годовой объём',
    yearlyDesc: 'Число сделок и стоимость (трлн сум)',
    categoryShare: 'Доля категорий',
    categoryDesc: 'Распределение по стоимости (%)',
    recentDeals: 'Последние сделки',
    recentDesc: 'Примеры записей · тестовый датасет'
  },
  market: {
    agriShare: 'Доля сельского хозяйства',
    agriHint: 'Крупнейшая категория по стоимости',
    ytdValue: 'Стоимость 2026 YTD',
    ytdHint: '+21.1% к тому же периоду 2025',
    contracts: 'Контракты',
    contractsHint: 'Активная торговая цепочка',
    byCategory: 'Стоимость по категориям',
    byCategoryDesc: 'Доля (%) и ориентировочно трлн сум',
    dealStatuses: 'Статусы сделок',
    asOf: 'По состоянию на 30.10.2026',
    status: 'Статус',
    count: 'Кол-во'
  },
  prices: {
    cottonAvg: 'Хлопок (средняя)',
    cottonHint: 'Октябрь 2026 · сум/т экв.',
    yoy: 'Рост YoY',
    yoyHint: 'Хлопок-сырец · к 2025 YTD',
    topRegion: 'Самый дорогой регион',
    topRegionHint: 'Хлопок в среднем 19.2 млн',
    dynamics: 'Динамика цен',
    dynamicsDesc: 'Ключевые товары · млн сум (индекс)',
    regional: 'Региональные цены',
    regionalDesc: 'Средняя цена и число сделок',
    region: 'Регион',
    product: 'Товар',
    avgMln: 'Средняя (млн)',
    deals: 'Сделки'
  },
  products: {
    core: 'Основные товары',
    coreHint: 'Стандартные названия (нормализация)',
    variants: 'Варианты написания',
    variantsHint: 'Разнообразие названий в сделках',
    topCategory: 'Топ-категория',
    topCategoryHint: '~52% стоимости',
    catalog: 'Каталог товаров',
    catalogDesc: 'Нормализация имён: марка / сорт / размер сохраняются',
    product: 'Товар',
    category: 'Категория',
    variantCount: 'Варианты',
    deals: 'Сделки',
    value: 'Стоимость'
  },
  deals: {
    total: 'Всего сделок',
    uniqueId: 'Уникальный ID',
    cancelled: 'Отменено',
    riskMonitor: 'Мониторинг рисков',
    partial: 'Частично исполнено',
    partialHint: 'В среднем доставлено ~60.9%',
    delay: 'Просрочка',
    delayHint: '{pct}% нарушение срока',
    tableTitle: 'Сделки и контракты',
    tableDesc: 'Последние примеры сделок',
    deal: 'Сделка',
    product: 'Товар',
    region: 'Регион',
    date: 'Дата',
    status: 'Статус',
    value: 'Стоимость'
  },
  participants: {
    total: 'Участники',
    totalHint: 'ИНН продавцов и покупателей',
    topSeller: 'Топ-продавец',
    topBuyer: 'Топ-покупатель',
    tableTitle: 'Анализ участников',
    tableDesc: 'Самые активные участники (пример)',
    name: 'Название',
    role: 'Роль',
    region: 'Регион',
    deals: 'Сделки',
    value: 'Стоимость',
    seller: 'Продавец',
    buyer: 'Покупатель'
  },
  brokers: {
    total: 'Брокеры',
    totalHint: 'Брокеры в реестре',
    highestCancel: 'Больше всего отмен',
    highestCancelHint: '1 450 отменённых сделок',
    lowestDelay: 'Меньше всего просрочек',
    lowestDelayHint: '2.4% delay rate',
    ranking: 'Рейтинг брокеров',
    rankingDesc: 'Объём, отмены и просрочки',
    broker: 'Брокер',
    deals: 'Сделки',
    cancelled: 'Отмены',
    delayPct: 'Просрочка %',
    sharePct: 'Доля %'
  },
  risk: {
    delayRate: 'Уровень просрочки',
    delayHint: '{count} сделок',
    monitoring: 'Мониторинг',
    cancelled: 'Отменено',
    cancelledHint: 'Проверка по брокеру / товару',
    partial: 'Частично исполнено',
    partialHint: 'В среднем доставлено ~60.9%'
  },
  ai: {
    conversations: 'Диалоги',
    newChat: 'Новый диалог',
    analyst: 'UZEX Market Analyst',
    analystHint: 'Live AI · PostgreSQL · ответы с источниками',
    askMarket: 'Спросите что-нибудь',
    askHint: 'Спросите о ценах, объёмах, рисках и участниках.',
    analyzing: 'Анализ…',
    send: 'Отправить',
    ready: 'готово',
    enterHint: 'Enter — отправить · Shift+Enter — новая строка',
    emptyReply: 'Ответ не получен. Попробуйте ещё раз.',
    restart: 'Начать заново',
    nextMessage: 'Следующее сообщение',
    demoEnded: 'Демо завершено',
    streaming: 'Поток ответа',
    context: 'Контекст анализа',
    contextHint: 'Фильтры текущего запроса и источники',
    period: 'Период',
    product: 'Товар',
    tools: 'Инструменты',
    toolOverview: 'Обзор рынка',
    toolPrices: 'Цены товаров',
    toolRisk: 'Риск поставки',
    toolCompare: 'Сравнение лет',
    dataset: 'Датасет',
    datasetBody:
      '500 000 сделок · 6 616 контрактов · синтетические тестовые данные (README). Не реальная статистика UZEX.'
  }
};
