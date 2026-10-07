import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { 
  Order, 
  OrderStatus, 
  OrderItem, 
  OrderType, 
  ManagerFunnelScenario, 
  WorkstationViewMode
} from '../types';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  Search, 
  Eye, 
  ArrowLeft, 
  ShieldCheck, 
  Receipt, 
  FileText, 
  Calendar, 
  CalendarRange,
  X, 
  LogOut, 
  RotateCcw, 
  MapPin,
  Phone,
  Download,
  Copy,
  MessageCircle,
  Kanban as KanbanIcon,
  Table as TableIcon,
  HelpCircle,
  Layers,
  Check,
  ChevronDown,
  Filter,
  Sparkles
} from 'lucide-react';
import { OnboardingTour, type TourStep } from './OnboardingTour';

export const Admin1CWorkstation: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    toggleOrderManagerConfirmation,
    confirmOrderByManager,
    convertQuoteToInvoice,
    convertRequestToQuote,
    cancelOrder,
    setPreviewOrder,
    setCurrentView,
    staffUser,
    logoutStaff,
    addToast
  } = useStore();

  // Active Funnel Scenario: 'all' | 'invoice' | 'quote' | 'request'
  const [activeScenario, setActiveScenario] = useState<ManagerFunnelScenario>('all');

  // View Mode: 'table' (Реестр по умолчанию) or 'kanban' (Воронка)
  const [viewMode, setViewMode] = useState<WorkstationViewMode>('table');

  // Month Period Filter: 'all' or 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmationFilter, setConfirmationFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  // Interactive Onboarding Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-launch tour on first visit
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem('chemexpress_manager_tour_completed');
      if (!tourSeen) {
        // slight delay for UI to settle
        const timer = setTimeout(() => setIsTourOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const tourSteps: TourStep[] = useMemo(() => [
    {
      targetId: 'tour-scenarios',
      title: 'Сценарии и воронка документов',
      description: 'Здесь вы быстро переключаетесь между всеми документами, счетами на оплату, коммерческими предложениями (КП) и входящими запросами. Справа видна сумма в работе и статус проверки.',
      placement: 'bottom'
    },
    {
      targetId: 'tour-search',
      title: 'Быстрый умный поиск',
      description: 'Мгновенный поиск любого документа по номеру (например CX-2026-1721), наименованию организации, БИН или номеру телефона клиента.',
      placement: 'bottom'
    },
    {
      targetId: 'tour-filters',
      title: 'Периоды, проверки и статусы',
      description: 'Фильтруйте заявки по месяцам создания, требующим проверки менеджером, и статусам оплаты/отгрузки. Кнопка «Экспорт CSV» сразу выгружает текущую отфильтрованную выборку.',
      placement: 'bottom'
    },
    {
      targetId: 'tour-view-mode',
      title: 'Реестр и Канбан-воронка',
      description: 'Переключайтесь в 1 клик между детальным табличным реестром документов и наглядной канбан-доской с колонками этапов сделки.',
      placement: 'bottom'
    },
    {
      targetId: 'tour-first-order',
      title: 'Карточка документа и согласование',
      description: 'Кликните на любую строку или карточку, чтобы открыть удобное модальное окно: проверить номенклатуру, скорректировать адрес доставки и в 1 клик утвердить документ для клиента.',
      placement: 'top'
    }
  ], []);

  // Inspector Drawer (Slide-over) State
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  // Delivery & Confirmation Form inside Inspector
  const [managerDeliveryAddress, setManagerDeliveryAddress] = useState('');
  const [managerDeliveryDays, setManagerDeliveryDays] = useState('1-2 рабочих дня');
  const [managerDeliveryCost, setManagerDeliveryCost] = useState<number>(0);
  const [managerComment, setManagerComment] = useState('');
  const [editableItems, setEditableItems] = useState<OrderItem[]>([]);
  const [copiedBin, setCopiedBin] = useState(false);

  // Keep inspectedOrder synced with store orders
  useEffect(() => {
    if (inspectedOrder) {
      const refreshed = orders.find(o => o.id === inspectedOrder.id);
      if (refreshed) {
        setInspectedOrder(refreshed);
      }
    }
  }, [orders]);

  // Load order data into edit form when inspected order changes
  useEffect(() => {
    if (inspectedOrder) {
      setManagerDeliveryAddress(inspectedOrder.deliveryAddress || inspectedOrder.client.deliveryAddress || '');
      setManagerDeliveryDays(inspectedOrder.deliveryDays || '1-2 рабочих дня (со склада Алматы)');
      setManagerDeliveryCost(inspectedOrder.deliveryCostKzt || 0);
      setManagerComment(inspectedOrder.managerComment || 'Наличие партии подтверждено со склада Алматы.');
      setEditableItems(inspectedOrder.items.map(it => ({ ...it })));
    }
  }, [inspectedOrder?.id]);

  // Prevent body scroll and handle Escape key when inspector modal is open
  useEffect(() => {
    if (inspectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectedOrder) {
        setInspectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inspectedOrder]);

  // Scenario counts and totals for current period
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, { count: number; totalKzt: number }>();
    
    // Add current month key by default
    const currentKey = new Date().toISOString().slice(0, 7);
    monthMap.set(currentKey, { count: 0, totalKzt: 0 });

    orders.forEach(order => {
      const key = order.createdAt ? order.createdAt.slice(0, 7) : currentKey;
      const existing = monthMap.get(key) || { count: 0, totalKzt: 0 };
      existing.count += 1;
      existing.totalKzt += order.totalKzt;
      monthMap.set(key, existing);
    });

    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      const stats = monthMap.get(key) || { count: 0, totalKzt: 0 };
      return {
        key,
        label: capitalized,
        count: stats.count,
        totalKzt: stats.totalKzt,
      };
    });
  }, [orders]);

  // Orders filtered by the selected month period
  const ordersInPeriod = useMemo(() => {
    if (selectedMonth === 'all') return orders;
    return orders.filter(o => o.createdAt && o.createdAt.startsWith(selectedMonth));
  }, [orders, selectedMonth]);

  // Scenario counts and totals (reactive to selected month period)
  const scenarioCounts = useMemo(() => {
    const totalCount = ordersInPeriod.length;
    const invoiceOrders = ordersInPeriod.filter(o => o.type === 'invoice');
    const quoteOrders = ordersInPeriod.filter(o => o.type === 'quote');
    const requestOrders = ordersInPeriod.filter(o => o.type === 'request');

    return {
      all: {
        count: totalCount,
        sum: ordersInPeriod.reduce((sum, o) => sum + o.totalKzt, 0),
        pending: ordersInPeriod.filter(o => !o.isManagerConfirmed).length,
      },
      invoice: {
        count: invoiceOrders.length,
        sum: invoiceOrders.reduce((sum, o) => sum + o.totalKzt, 0),
        pending: invoiceOrders.filter(o => !o.isManagerConfirmed).length,
      },
      quote: {
        count: quoteOrders.length,
        sum: quoteOrders.reduce((sum, o) => sum + o.totalKzt, 0),
        pending: quoteOrders.filter(o => !o.isManagerConfirmed).length,
      },
      request: {
        count: requestOrders.length,
        sum: requestOrders.reduce((sum, o) => sum + o.totalKzt, 0),
        pending: requestOrders.filter(o => !o.isManagerConfirmed).length,
      },
    };
  }, [ordersInPeriod]);

  // Filtered orders according to scenario, month, search, and criteria
  const scenarioFilteredOrders = useMemo(() => {
    return ordersInPeriod.filter(order => {
      // 1. Scenario type filter
      if (activeScenario !== 'all' && order.type !== activeScenario) {
        return false;
      }

      // 2. Search query filter
      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase().trim();
        const matchNumber = order.orderNumber.toLowerCase().includes(query);
        const matchCompany = order.client.companyName.toLowerCase().includes(query);
        const matchBin = order.client.bin.includes(query);
        const matchContact = (order.client.contactName || '').toLowerCase().includes(query);
        const matchPhone = (order.client.contactPhone || '').includes(query);
        if (!matchNumber && !matchCompany && !matchBin && !matchContact && !matchPhone) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // 4. Confirmation filter
      if (confirmationFilter === 'pending' && order.isManagerConfirmed) {
        return false;
      }
      if (confirmationFilter === 'confirmed' && !order.isManagerConfirmed) {
        return false;
      }

      return true;
    });
  }, [ordersInPeriod, activeScenario, orderSearch, statusFilter, confirmationFilter]);

  // Quick actions
  const handleSaveConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedOrder) return;
    confirmOrderByManager(inspectedOrder.id, {
      deliveryAddress: managerDeliveryAddress,
      deliveryDays: managerDeliveryDays,
      deliveryCostKzt: Number(managerDeliveryCost) || 0,
      managerComment: managerComment,
      items: editableItems,
    });
  };

  const handleUpdateItemName = (index: number, newName: string) => {
    setEditableItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: newName, nameRu: newName };
      return copy;
    });
  };

  const handleCopyRequisites = (order: Order) => {
    const text = `Организация: ${order.client.companyName}
БИН: ${order.client.bin}
ИИК: ${order.client.iik || '—'}
БИК: ${order.client.bik || 'HSBKKZKX'}
Банк: ${order.client.bankName || 'АО "Народный Банк Казахстана"'}
Контакт: ${order.client.contactName || '—'} (${order.client.contactPhone || '—'})
Адрес доставки: ${order.deliveryAddress || order.client.deliveryAddress || '—'}`;
    navigator.clipboard.writeText(text);
    setCopiedBin(true);
    setTimeout(() => setCopiedBin(false), 2000);
    addToast({
      type: 'info',
      title: 'Реквизиты скопированы',
      message: `${order.client.companyName} (БИН: ${order.client.bin})`,
      duration: 3000,
    });
  };

  const getWhatsAppUrl = (order: Order) => {
    const phoneDigits = (order.client.contactPhone || '').replace(/\D/g, '');
    const targetPhone = phoneDigits.startsWith('8') ? '7' + phoneDigits.slice(1) : phoneDigits;
    const docTypeName = 
      order.type === 'invoice' ? 'Счёт на оплату' : 
      order.type === 'quote' ? 'Коммерческое предложение' : 'Запрос на поставку';
    const message = `Здравствуйте, ${order.client.contactName || 'партнёр'}!
Вас беспокоит ChemExpress (отдел B2B поставок).
Подготовлен ${docTypeName} № ${order.orderNumber} на сумму ${order.totalKzt.toLocaleString('ru-RU')} ₸.
Условия наличия на складе Алматы и спецификация зафиксированы.
Готовы ответить на любые вопросы по поставке.`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  const exportToCsv = () => {
    const headers = [
      'Номер документа',
      'Тип сценария',
      'Статус',
      'Дата',
      'Контрагент',
      'БИН',
      'Контакт',
      'Телефон',
      'Email',
      'Сумма, KZT',
      'Подтверждено менеджером',
      'Срок поставки',
      'Адрес доставки'
    ];
    const rows = scenarioFilteredOrders.map(o => [
      o.orderNumber,
      o.type === 'invoice' ? 'Счёт на оплату' : o.type === 'quote' ? 'КП' : 'Запрос',
      o.status,
      new Date(o.createdAt).toLocaleDateString('ru-RU'),
      `"${(o.client.companyName || '').replace(/"/g, '""')}"`,
      o.client.bin,
      `"${(o.client.contactName || '').replace(/"/g, '""')}"`,
      o.client.contactPhone,
      o.client.contactEmail,
      o.totalKzt,
      o.isManagerConfirmed ? 'Да' : 'Нет',
      `"${(o.deliveryDays || '').replace(/"/g, '""')}"`,
      `"${(o.deliveryAddress || o.client.deliveryAddress || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chemexpress_registry_${activeScenario}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Реестр выгружен в CSV',
      message: `Экспортировано ${scenarioFilteredOrders.length} документов`,
      duration: 3500,
    });
  };

  // Status Badges
  const getStatusBadge = (status: OrderStatus, type: OrderType) => {
    switch (status) {
      case 'invoice_issued':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 whitespace-nowrap">
            <Receipt className="w-3 h-3 text-sky-600 shrink-0" />
            <span>Счёт выставлен</span>
          </span>
        );
      case 'quote_sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
            <span>{type === 'request' ? 'Расчет готов (КП)' : 'КП сформировано'}</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Оплачен (Резерв)</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap">
            <Truck className="w-3 h-3 text-indigo-600 shrink-0" />
            <span>Отгружен со склада</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Аннулирован</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{type === 'request' ? 'Новый запрос' : 'Черновик'}</span>
          </span>
        );
    }
  };

  const getScenarioBadge = (type: OrderType) => {
    switch (type) {
      case 'invoice':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
            <Receipt className="w-2.5 h-2.5" />
            <span>Счёт</span>
          </span>
        );
      case 'quote':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
            <FileText className="w-2.5 h-2.5" />
            <span>КП</span>
          </span>
        );
      case 'request':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            <HelpCircle className="w-2.5 h-2.5" />
            <span>Запрос</span>
          </span>
        );
    }
  };

  // Kanban Columns Definition depending on scenario
  const kanbanColumns = useMemo(() => {
    if (activeScenario === 'invoice') {
      return [
        {
          id: 'col-new',
          title: 'Новые счета (ждут проверки)',
          description: 'Уточнение наличия и согласование доставки',
          filter: (o: Order) => !o.isManagerConfirmed && o.status !== 'cancelled',
          accent: 'border-amber-400 bg-amber-50/20',
          badgeColor: 'text-amber-800 bg-amber-100',
        },
        {
          id: 'col-issued',
          title: 'Выставлены (ожидание оплаты)',
          description: 'Условия согласованы, отправлены контрагенту',
          filter: (o: Order) => o.isManagerConfirmed && o.status === 'invoice_issued',
          accent: 'border-sky-400 bg-sky-50/20',
          badgeColor: 'text-sky-800 bg-sky-100',
        },
        {
          id: 'col-paid',
          title: 'Оплачены (Резерв на складе)',
          description: 'Оплата поступила, партии зарезервированы',
          filter: (o: Order) => o.status === 'paid',
          accent: 'border-emerald-400 bg-emerald-50/20',
          badgeColor: 'text-emerald-800 bg-emerald-100',
        },
        {
          id: 'col-shipped',
          title: 'Отгружены клиенту',
          description: 'Расходные накладные оформлены',
          filter: (o: Order) => o.status === 'shipped',
          accent: 'border-indigo-400 bg-indigo-50/20',
          badgeColor: 'text-indigo-800 bg-indigo-100',
        },
      ];
    }

    if (activeScenario === 'quote') {
      return [
        {
          id: 'col-quote-draft',
          title: 'Входящие запросы КП',
          description: 'Запросы цен и спецификаций от клиентов',
          filter: (o: Order) => !o.isManagerConfirmed && o.status !== 'cancelled',
          accent: 'border-amber-400 bg-amber-50/20',
          badgeColor: 'text-amber-800 bg-amber-100',
        },
        {
          id: 'col-quote-confirmed',
          title: 'Утверждены / Отправлены',
          description: 'Условия согласованы, готово к сделке',
          filter: (o: Order) => o.isManagerConfirmed && o.status === 'quote_sent',
          accent: 'border-purple-400 bg-purple-50/20',
          badgeColor: 'text-purple-800 bg-purple-100',
        },
        {
          id: 'col-quote-closed',
          title: 'Завершённые / В сделке',
          description: 'Принято клиентом в дальнейшую работу',
          filter: (o: Order) => o.status === 'paid' || o.status === 'shipped',
          accent: 'border-emerald-400 bg-emerald-50/20',
          badgeColor: 'text-emerald-800 bg-emerald-100',
        },
      ];
    }

    if (activeScenario === 'request') {
      return [
        {
          id: 'col-req-new',
          title: 'Новые запросы на расчет',
          description: 'Нестандартные реактивы и редкие стандарты',
          filter: (o: Order) => !o.isManagerConfirmed && o.status === 'draft',
          accent: 'border-amber-400 bg-amber-50/20',
          badgeColor: 'text-amber-800 bg-amber-100',
        },
        {
          id: 'col-req-processing',
          title: 'В обработке (Поиск / Запрос цен)',
          description: 'Запрос у заводов TCI, Macklin, BSY',
          filter: (o: Order) => !o.isManagerConfirmed && o.status !== 'draft',
          accent: 'border-blue-400 bg-blue-50/20',
          badgeColor: 'text-blue-800 bg-blue-100',
        },
        {
          id: 'col-req-ready',
          title: 'Расчет готов (КП сформировано)',
          description: 'Готово к переводу в официальный счёт',
          filter: (o: Order) => o.isManagerConfirmed,
          accent: 'border-emerald-400 bg-emerald-50/20',
          badgeColor: 'text-emerald-800 bg-emerald-100',
        },
      ];
    }

    // Default 'all' general funnel
    return [
      {
        id: 'col-all-pending',
        title: 'Входящие (требуют действий)',
        description: 'Новые счета, КП и запросы на расчет',
        filter: (o: Order) => !o.isManagerConfirmed && o.status !== 'cancelled',
        accent: 'border-amber-400 bg-amber-50/20',
        badgeColor: 'text-amber-800 bg-amber-100',
      },
      {
        id: 'col-all-confirmed',
        title: 'На согласовании / Выставлены',
        description: 'Условия согласованы, отправлены контрагенту',
        filter: (o: Order) => o.isManagerConfirmed && (o.status === 'invoice_issued' || o.status === 'quote_sent'),
        accent: 'border-sky-400 bg-sky-50/20',
        badgeColor: 'text-sky-800 bg-sky-100',
      },
      {
        id: 'col-all-paid',
        title: 'Оплачены (Резерв на складе)',
        description: 'Готовы к комплектации и упаковке',
        filter: (o: Order) => o.status === 'paid',
        accent: 'border-emerald-400 bg-emerald-50/20',
        badgeColor: 'text-emerald-800 bg-emerald-100',
      },
      {
        id: 'col-all-shipped',
        title: 'Отгружены / Выполнены',
        description: 'Закрытые сделки текущего периода',
        filter: (o: Order) => o.status === 'shipped',
        accent: 'border-indigo-400 bg-indigo-50/20',
        badgeColor: 'text-indigo-800 bg-indigo-100',
      },
    ];
  }, [activeScenario]);

  return (
    <div className="space-y-4">      {/* 1. TOP HEADER BAR */}
      <header className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ChemExpress" className="h-6 w-auto object-contain shrink-0" />
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                АРМ менеджера по снабжению
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-none">
              Воронки счетов, согласование условий доставки и реестр документов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Manual Tour / Walkthrough Button */}
          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100/70 text-cyan-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Обучение: запустить пошаговый тур по интерфейсу"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Обучение</span>
          </button>

          {/* Admin panel link if admin */}
          {staffUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Панель администратора"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">Управление</span>
            </button>
          )}

          {/* Return to storefront */}
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>В каталог</span>
          </button>

          {/* Staff Profile Capsule */}
          {staffUser && (
            <div className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="w-6 h-6 rounded-lg bg-cyan-700 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                {staffUser.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <div className="font-semibold text-slate-900 text-xs leading-none">{staffUser.fullName}</div>
                <div className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                  {staffUser.role === 'admin' ? 'Администратор' : 'Менеджер B2B'}
                </div>
              </div>
              <button
                type="button"
                onClick={logoutStaff}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. UNIFIED B2B COMMAND BAR WITH INTEGRATED SCENARIO PILLS & COMPACT KPI */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-3 space-y-3">
        {/* Top Row: Scenario Filter Pills + Financial Quick-KPI */}
        <div id="tour-scenarios" className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          {/* Scenario Tabs (Linear/Stripe style) */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveScenario('all');
                setStatusFilter('all');
                setConfirmationFilter('all');
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenario === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Все</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                activeScenario === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-200 text-slate-700'
              }`}>
                {scenarioCounts.all.count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScenario('invoice');
                setStatusFilter('all');
                setConfirmationFilter('all');
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenario === 'invoice'
                  ? 'bg-white text-blue-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-blue-600" />
              <span>Счета на оплату</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                activeScenario === 'invoice' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-100/70 text-blue-800'
              }`}>
                {scenarioCounts.invoice.count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScenario('quote');
                setStatusFilter('all');
                setConfirmationFilter('all');
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenario === 'quote'
                  ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>КП (Предложения)</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                activeScenario === 'quote' ? 'bg-indigo-600 text-white font-bold' : 'bg-indigo-100/70 text-indigo-800'
              }`}>
                {scenarioCounts.quote.count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScenario('request');
                setStatusFilter('all');
                setConfirmationFilter('all');
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeScenario === 'request'
                  ? 'bg-white text-amber-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Запросы на расчет</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                activeScenario === 'request' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-100 text-amber-800'
              }`}>
                {scenarioCounts.request.count}
              </span>
            </button>
          </div>

          {/* Clean Financial Metrics Summary for current scenario */}
          <div className="flex items-center gap-4 text-xs ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Сумма в выборке:</span>
              <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                {activeScenario === 'all' && `${scenarioCounts.all.sum.toLocaleString('ru-RU')} ₸`}
                {activeScenario === 'invoice' && `${scenarioCounts.invoice.sum.toLocaleString('ru-RU')} ₸`}
                {activeScenario === 'quote' && `${scenarioCounts.quote.sum.toLocaleString('ru-RU')} ₸`}
                {activeScenario === 'request' && `${scenarioCounts.request.sum.toLocaleString('ru-RU')} ₸`}
              </span>
            </div>

            {/* Operational alert indicator */}
            {((activeScenario === 'all' && scenarioCounts.all.pending > 0) ||
              (activeScenario === 'invoice' && scenarioCounts.invoice.pending > 0) ||
              (activeScenario === 'quote' && scenarioCounts.quote.pending > 0) ||
              (activeScenario === 'request' && scenarioCounts.request.pending > 0)) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  {activeScenario === 'all' && `${scenarioCounts.all.pending} на согласовании`}
                  {activeScenario === 'invoice' && `${scenarioCounts.invoice.pending} ждут условий`}
                  {activeScenario === 'quote' && `${scenarioCounts.quote.pending} в работе`}
                  {activeScenario === 'request' && `${scenarioCounts.request.pending} новый запрос`}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Row: Streamlined Enterprise Control Bar */}
        <div className="pt-1 space-y-2.5">
          {/* Row 1: Search (Left) + View Switcher (Right) */}
          <div className="flex items-center justify-between gap-3">
            <div id="tour-search" className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Поиск по номеру заказа, организации, БИН или телефону..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:border-slate-900 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all shadow-2xs"
              />
              {orderSearch && (
                <button
                  type="button"
                  onClick={() => setOrderSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Segmented View Mode Slider (Table vs Kanban) */}
            <div id="tour-view-mode" className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Реестр</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <KanbanIcon className="w-3.5 h-3.5" />
                <span>Воронка</span>
              </button>
            </div>
          </div>

          {/* Row 2: Filters (Period, Check, Status) -> followed by Export CSV */}
          <div id="tour-filters" className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
            {/* Left side: Period, Check, Status Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Parameter 1: Month Period */}
              <div className="flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Период:</span>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none hover:border-slate-300 focus:border-slate-900 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="all">Все месяцы ({orders.length} док.)</option>
                    {availableMonths.map(m => (
                      <option key={m.key} value={m.key}>
                        {m.label} ({m.count} док. • {m.totalKzt.toLocaleString('ru-RU')} ₸)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>

              {/* Parameter 2: Confirmation Check */}
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Проверка:</span>
                <div className="relative">
                  <select
                    value={confirmationFilter}
                    onChange={(e) => setConfirmationFilter(e.target.value as any)}
                    className="appearance-none pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none hover:border-slate-300 focus:border-slate-900 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="all">Все проверки</option>
                    <option value="pending">Требуют согласования</option>
                    <option value="confirmed">Подтверждены</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>

              {/* Parameter 3: Order Status */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Статус:</span>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none hover:border-slate-300 focus:border-slate-900 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="all">Все статусы</option>
                    <option value="invoice_issued">Счёт выставлен</option>
                    <option value="quote_sent">КП отправлено</option>
                    <option value="paid">Оплачен (Резерв)</option>
                    <option value="shipped">Отгружен</option>
                    <option value="cancelled">Аннулирован</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>

              {/* Reset Filter Button */}
              {(selectedMonth !== 'all' || confirmationFilter !== 'all' || statusFilter !== 'all' || orderSearch !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearch('');
                    setSelectedMonth('all');
                    setConfirmationFilter('all');
                    setStatusFilter('all');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs"
                  title="Сбросить все примененные фильтры"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сброс ({scenarioFilteredOrders.length})</span>
                </button>
              )}
            </div>

            {/* Right side: Export CSV (immediately follows the filter criteria) */}
            <div className="ml-auto">
              <button
                type="button"
                onClick={exportToCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Выгрузить отфильтрованную выборку в Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Экспорт CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT: KANBAN OR TABLE */}
      {viewMode === 'kanban' ? (
        /* KANBAN FUNNEL BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map(column => {
            const columnOrders = scenarioFilteredOrders.filter(column.filter);
            const columnTotalKzt = columnOrders.reduce((sum, o) => sum + o.totalKzt, 0);

            return (
              <div 
                key={column.id} 
                className="bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col max-h-[820px]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/70 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {column.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${column.badgeColor}`}>
                      {columnOrders.length}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-[11px] text-slate-500">
                    <span className="truncate pr-2">{column.description}</span>
                    <span className="font-mono font-bold text-slate-800 shrink-0 tabular-nums">
                      {columnTotalKzt.toLocaleString('ru-RU')} ₸
                    </span>
                  </div>
                </div>

                {/* Column Cards List */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[160px]">
                  {columnOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl bg-white/40">
                      Нет документов в этом статусе
                    </div>
                  ) : (
                    columnOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => setInspectedOrder(order)}
                        className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2.5 group"
                      >
                        {/* Top: Badges and Number */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {getScenarioBadge(order.type)}
                            <span className="font-mono font-bold text-xs text-navy-950 group-hover:text-blue-600 transition-colors">
                              {order.orderNumber}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>

                        {/* Client details */}
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">
                            {order.client.companyName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>БИН {order.client.bin}</span>
                          </div>
                        </div>

                        {/* Items summary */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                          <span className="truncate">
                            {order.items[0]?.name || 'Позиции заказа'}
                            {order.items.length > 1 && ` (+${order.items.length - 1})`}
                          </span>
                          <span className="font-mono text-slate-400 shrink-0 ml-1">
                            {order.items.length} поз.
                          </span>
                        </div>

                        {/* Confirmation & Status indicators */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <div>
                            {order.isManagerConfirmed ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Утверждено</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                                <span>Требует проверки</span>
                              </span>
                            )}
                          </div>

                          <div className="font-mono font-black text-xs text-navy-950 tabular-nums">
                            {order.totalKzt.toLocaleString('ru-RU')} ₸
                          </div>
                        </div>

                        {/* Quick action bar on hover/mobile */}
                        <div className="pt-1.5 flex items-center justify-between gap-1 text-[11px]" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={getWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Написать в WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <div className="flex items-center gap-1">
                            {/* Conversion button for Quotes */}
                            {order.type === 'quote' && (
                              <button
                                type="button"
                                onClick={() => convertQuoteToInvoice(order.id)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                                title="Сформировать счёт на оплату из КП"
                              >
                                В Счёт
                              </button>
                            )}

                            {/* Conversion button for Requests */}
                            {order.type === 'request' && (
                              <button
                                type="button"
                                onClick={() => convertRequestToQuote(order.id)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                                title="Сформировать коммерческое предложение из запроса"
                              >
                                В КП
                              </button>
                            )}

                            {/* Mark paid button */}
                            {order.isManagerConfirmed && order.status !== 'paid' && order.status !== 'shipped' && order.type === 'invoice' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'paid')}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                title="Зафиксировать оплату (товар в резерв)"
                              >
                                Оплачен
                              </button>
                            )}

                            {/* View printable PDF */}
                            <button
                              type="button"
                              onClick={() => setPreviewOrder(order)}
                              className="p-1 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors"
                              title="Открыть официальный бланк документа"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE REGISTRY VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 w-32 font-mono whitespace-nowrap">Документ</th>
                  <th className="p-3.5 w-24 whitespace-nowrap">Сценарий</th>
                  <th className="p-3.5 w-24 whitespace-nowrap">Дата</th>
                  <th className="p-3.5 min-w-[220px]">Контрагент / БИН</th>
                  <th className="p-3.5 w-28 text-right font-mono whitespace-nowrap">Сумма, ₸</th>
                  <th className="p-3.5 w-36 whitespace-nowrap">Согласование</th>
                  <th className="p-3.5 w-40 whitespace-nowrap">Статус</th>
                  <th className="p-3.5 w-44 text-right whitespace-nowrap">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {scenarioFilteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-semibold text-slate-600">Документы не найдены</div>
                        <div className="text-[11px] text-slate-400">
                          Измените условия поиска или переключите сценарий воронки.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  scenarioFilteredOrders.map((order, idx) => (
                    <tr 
                      key={order.id} 
                      id={idx === 0 ? 'tour-first-order' : undefined}
                      onClick={() => setInspectedOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Document Number */}
                      <td className="p-3.5 font-mono font-bold text-navy-900 group-hover:text-blue-600">
                        {order.orderNumber}
                      </td>

                      {/* Scenario badge */}
                      <td className="p-3.5">
                        {getScenarioBadge(order.type)}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Client details */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 leading-snug">
                          {order.client.companyName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>БИН: {order.client.bin}</span>
                          {order.client.contactName && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 truncate">{order.client.contactName}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="font-bold text-slate-900 text-xs tabular-nums">
                          {order.totalKzt.toLocaleString('ru-RU')} ₸
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.vatMode === 'vat16' ? 'с НДС 16%' : 'без НДС'}
                        </div>
                      </td>

                      {/* Confirmation Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {order.isManagerConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Подтверждено</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                            <span>Требует проверки</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getStatusBadge(order.status, order.type)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp */}
                          <a
                            href={getWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Написать в WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Inspect drawer */}
                          <button
                            type="button"
                            onClick={() => setInspectedOrder(order)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                            title="Открыть карточку заказа и согласования"
                          >
                            Открыть
                          </button>

                          {/* Printable sheet */}
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Просмотреть официальный документ для печати"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. QUICK ORDER INSPECTOR MODAL */}
      {inspectedOrder && (
        <div 
          className="fixed inset-0 !m-0 z-50 flex items-start justify-center pt-2 sm:pt-3 md:pt-4 pb-3 px-2 sm:px-4 md:px-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setInspectedOrder(null)}
        >
          <div 
            className="relative w-full max-w-5xl max-h-[96vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-lg font-black text-cyan-400 tracking-wide">
                      {inspectedOrder.orderNumber}
                    </span>
                    {getScenarioBadge(inspectedOrder.type)}
                    {getStatusBadge(inspectedOrder.status, inspectedOrder.type)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                    <span className="font-semibold text-white">{inspectedOrder.client.companyName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-slate-400">БИН: {inspectedOrder.client.bin}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      от {new Date(inspectedOrder.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setPreviewOrder(inspectedOrder)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  title="Печать официального бланка А4"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Бланк А4 / Печать</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  title="Закрыть (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Scroll */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Specification & Counterparty Dossier (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Quick Communication Box */}
                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={getWhatsAppUrl(inspectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Написать в WhatsApp</span>
                      </a>

                      {inspectedOrder.client.contactPhone && (
                        <a
                          href={`tel:${inspectedOrder.client.contactPhone}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-all shadow-2xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{inspectedOrder.client.contactPhone}</span>
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyRequisites(inspectedOrder)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                    >
                      {copiedBin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedBin ? 'Скопировано!' : 'Скопировать реквизиты'}</span>
                    </button>
                  </div>

                  {/* Client & Bank Details Card */}
                  <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                        <Building2 className="w-4 h-4 text-cyan-700" />
                        <span>Карточка контрагента</span>
                      </h4>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        БИН: {inspectedOrder.client.bin}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Наименование организации</span>
                        <strong className="text-slate-900 font-semibold">{inspectedOrder.client.companyName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Контактное лицо</span>
                        <span className="text-slate-800 font-medium">{inspectedOrder.client.contactName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Счет ИИК</span>
                        <span className="font-mono text-slate-800 font-semibold">{inspectedOrder.client.iik || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">БИК и Банк</span>
                        <span className="text-slate-800">{inspectedOrder.client.bik || 'HSBKKZKX'} • {inspectedOrder.client.bankName || 'Народный Банк'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Электронная почта</span>
                        <span className="text-slate-800 font-mono">{inspectedOrder.client.contactEmail || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Адрес доставки (от клиента)</span>
                        <span className="text-slate-800">{inspectedOrder.client.deliveryAddress || 'Не указан'}</span>
                      </div>
                    </div>

                    {inspectedOrder.clientMessage && (
                      <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-950 text-xs leading-relaxed">
                        <strong className="font-semibold text-amber-900">Примечание от заказчика:</strong> «{inspectedOrder.clientMessage}»
                      </div>
                    )}
                  </div>

                  {/* Order Items Specification */}
                  <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                        <FileText className="w-4 h-4 text-cyan-700" />
                        <span>Спецификация позиций ({editableItems.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">Стандарт РК • Редактируемые наименования</span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {editableItems.map((item, idx) => (
                        <div key={item.productId || idx} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span className="font-bold text-slate-700">№{idx + 1} • Артикул: {item.sku}</span>
                            {item.casNumber && item.casNumber !== 'N/A' && (
                              <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px] text-slate-700">CAS: {item.casNumber}</span>
                            )}
                          </div>

                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItemName(idx, e.target.value)}
                            placeholder="Официальное наименование на русском языке"
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none transition-all"
                          />

                          <div className="flex items-center justify-between text-xs pt-0.5 text-slate-600 font-mono">
                            <span>Количество: <strong className="text-slate-900">{item.quantity}</strong> ({item.packaging}) • {item.priceKzt.toLocaleString('ru-RU')} ₸/ед.</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {(item.priceKzt * item.quantity).toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Delivery Terms & Manager Approval Form (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                  <form onSubmit={handleSaveConfirmation} className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                        <Truck className="w-4 h-4 text-cyan-700" />
                        <span>Параметры и согласование</span>
                      </h4>
                      {inspectedOrder.isManagerConfirmed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Утверждено
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Ожидает утверждения
                        </span>
                      )}
                    </div>

                    {/* 1. Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Адрес доставки:</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={managerDeliveryAddress}
                        onChange={(e) => setManagerDeliveryAddress(e.target.value)}
                        placeholder="г. Алматы, склад получателя"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-medium focus:border-cyan-600 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* 2. Days */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Срок поставки / готовности:</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={managerDeliveryDays}
                        onChange={(e) => setManagerDeliveryDays(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-medium focus:border-cyan-600 focus:bg-white transition-colors"
                      />
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {[
                          '1-2 рабочих дня (со склада Алматы)',
                          '3-5 рабочих дней (по РК)',
                          '7-14 рабочих дней (под заказ)',
                          'Самовывоз со склада ChemExpress',
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setManagerDeliveryDays(preset)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                              managerDeliveryDays === preset
                                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Cost */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Стоимость доставки:</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={managerDeliveryCost}
                          onChange={(e) => setManagerDeliveryCost(Number(e.target.value))}
                          className="w-full p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono font-bold text-xs focus:border-cyan-600 focus:bg-white transition-colors"
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-xs">₸</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {[
                          { label: '0 ₸ (Включена / Самовывоз)', val: 0 },
                          { label: '3 500 ₸ (Алматы)', val: 3500 },
                          { label: '5 000 ₸ (Область)', val: 5000 },
                          { label: '12 000 ₸ (Регионы РК)', val: 12000 },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setManagerDeliveryCost(item.val)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                              managerDeliveryCost === item.val
                                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Manager Comment */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Примечание менеджера в официальный бланк:
                      </label>
                      <textarea
                        rows={2}
                        value={managerComment}
                        onChange={(e) => setManagerComment(e.target.value)}
                        placeholder="Например: Партия проверена на складе Алматы. Паспорт CoA прилагается."
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-medium focus:border-cyan-600 focus:bg-white resize-none transition-colors"
                      />
                    </div>

                    {/* Financial Totals Calculation Box */}
                    <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-600">
                        <span>Сумма товаров:</span>
                        <span>{inspectedOrder.subtotalKzt.toLocaleString('ru-RU')} ₸</span>
                      </div>
                      {inspectedOrder.vatKzt && inspectedOrder.vatKzt > 0 ? (
                        <div className="flex justify-between text-slate-600">
                          <span>В том числе НДС 16%:</span>
                          <span>{inspectedOrder.vatKzt.toLocaleString('ru-RU')} ₸</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-slate-600">
                        <span>Доставка:</span>
                        <span>{(Number(managerDeliveryCost) || 0).toLocaleString('ru-RU')} ₸</span>
                      </div>
                      <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
                        <span className="font-sans font-bold">ИТОГО К ОПЛАТЕ:</span>
                        <span className="text-base text-cyan-900">
                          {((inspectedOrder.subtotalKzt + (inspectedOrder.vatKzt || 0)) + (Number(managerDeliveryCost) || 0)).toLocaleString('ru-RU')} ₸
                        </span>
                      </div>
                    </div>

                    {/* Approval Buttons */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      {inspectedOrder.isManagerConfirmed && (
                        <button
                          type="button"
                          onClick={() => toggleOrderManagerConfirmation(inspectedOrder.id)}
                          className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                        >
                          Снять согласование
                        </button>
                      )}
                      <button
                        type="submit"
                        className="ml-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Сохранить и утвердить условия</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Convert Quote to Invoice */}
                {inspectedOrder.type === 'quote' && (
                  <button
                    type="button"
                    onClick={() => convertQuoteToInvoice(inspectedOrder.id)}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Сформировать Счёт на оплату</span>
                  </button>
                )}

                {/* Convert Request to Quote */}
                {inspectedOrder.type === 'request' && (
                  <button
                    type="button"
                    onClick={() => convertRequestToQuote(inspectedOrder.id)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Сформировать КП</span>
                  </button>
                )}

                {/* Mark Paid (Reserve Stock) */}
                {inspectedOrder.isManagerConfirmed && inspectedOrder.status !== 'paid' && inspectedOrder.status !== 'shipped' && inspectedOrder.type === 'invoice' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(inspectedOrder.id, 'paid')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Оплачен (Резерв на складе)</span>
                  </button>
                )}

                {/* Mark Shipped */}
                {inspectedOrder.status === 'paid' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(inspectedOrder.id, 'shipped')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Отгрузить со склада</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {inspectedOrder.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => cancelOrder(inspectedOrder.id)}
                    className="px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
                  >
                    Аннулировать
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Onboarding Tour (Canva / Linear style walkthrough) */}
      <OnboardingTour
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};
