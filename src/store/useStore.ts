import { create } from 'zustand';
import type { 
  ChemProduct, 
  InventoryItem, 
  Order, 
  OrderItem, 
  WarehouseId, 
  OrderType, 
  StockMovement, 
  ClientEntity,
  OrganizationEntity,
  UserAccount,
  RegisterUserData,
  StaffUser
} from '../types';
import { 
  INITIAL_FALLBACK_PRODUCTS,
  DEFAULT_ORGANIZATIONS,
  DEFAULT_USERS
} from '../data/mockData';

export interface CartItem {
  product: InventoryItem;
  quantity: number;
  warehouseId: WarehouseId;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface AppState {
  currentView: 'catalog' | 'manager' | 'admin' | 'login';
  setCurrentView: (view: 'catalog' | 'manager' | 'admin' | 'login') => void;

  // Staff (Manager / Admin) Authentication
  staffUser: StaffUser | null;
  loginStaff: (email: string, pass: string) => { success: boolean; error?: string };
  logoutStaff: () => void;

  // Live API Products
  catalogTab: 'reagents' | 'dishware' | 'other';
  products: InventoryItem[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  selectedBrand: string;
  selectedWarehouse: string;
  onlyInStock: boolean;

  setCatalogTab: (tab: 'reagents' | 'dishware' | 'other', updateUrl?: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedBrand: (brand: string) => void;
  setSelectedWarehouse: (wh: string) => void;
  setOnlyInStock: (val: boolean) => void;
  fetchLiveProducts: () => Promise<void>;

  // Stock overrides & memory
  inventoryStore: Record<number, InventoryItem>;

  // Cart / Specification
  cart: CartItem[];
  addToCart: (product: InventoryItem, quantity?: number, warehouseId?: WarehouseId) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;

  // Drawer / Order modal
  isOrderDrawerOpen: boolean;
  orderDrawerType: OrderType;
  openOrderDrawer: (type?: OrderType) => void;
  closeOrderDrawer: () => void;

  // Tax & VAT mode (ИП на ОУР: 'none' = без НДС, 'vat16' = с НДС 16%)
  vatMode: 'none' | 'vat16';
  setVatMode: (mode: 'none' | 'vat16') => void;

  // Orders / B2B Documents
  orders: Order[];
  createOrder: (orderData: {
    type: OrderType;
    client: ClientEntity;
    items: OrderItem[];
    clientMessage?: string;
    validDays?: number;
    vatMode?: 'none' | 'vat16';
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  toggleOrderManagerConfirmation: (orderId: string) => void;
  confirmOrderByManager: (
    orderId: string,
    details?: {
      deliveryAddress?: string;
      deliveryCity?: string;
      deliveryDays?: string;
      deliveryCostKzt?: number;
      managerComment?: string;
      items?: OrderItem[];
    }
  ) => void;
  convertQuoteToInvoice: (orderId: string) => void;
  convertRequestToQuote: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;

  // Document preview modal
  previewOrder: Order | null;
  setPreviewOrder: (order: Order | null) => void;

  // My Documents modal (client history)
  isMyDocumentsOpen: boolean;
  openMyDocuments: () => void;
  closeMyDocuments: () => void;

  // Stock movements
  movements: StockMovement[];

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Auth & Multi-User Organization by BIN
  currentUser: UserAccount | null;
  currentOrganization: OrganizationEntity | null;
  users: UserAccount[];
  organizations: OrganizationEntity[];
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authCallbackAction: (() => void) | null;
  isOrgProfileModalOpen: boolean;

  login: (email: string) => boolean;
  register: (data: RegisterUserData) => boolean;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register', onComplete?: () => void) => void;
  closeAuthModal: () => void;
  openOrgProfileModal: () => void;
  closeOrgProfileModal: () => void;

  // Helpers
  getAvailableStock: (product: InventoryItem, warehouseId?: WarehouseId) => number;
}

// Helper to enrich a raw ChemProduct with 1C stock & pricing
export const enrichProduct = (raw: ChemProduct, existing?: InventoryItem): InventoryItem => {
  if (existing) return existing;

  // Generate realistic price if not present in API
  let price = raw.price || 0;
  if (!price || price <= 0) {
    const hash = (raw.id * 17 + (raw.product_code?.length || 5) * 31) % 35000;
    price = 12000 + Math.abs(hash);
  }

  // Generate realistic stock across warehouses based on product ID
  const isSpecial = raw.storage?.includes('2~8') || raw.storage?.includes('−20') || raw.storage?.includes('-20') || raw.title_ru?.includes('ИФА');

  const seed = (raw.id * 13) % 100;
  const centralStock = seed > 20 ? Math.floor(seed / 2) : 0;
  const specStock = isSpecial ? 15 : seed > 50 ? 10 : 0;

  return {
    ...raw,
    computedPrice: price,
    stock: [
      { warehouseId: 'wh-almaty-central', physical: centralStock, reserved: 0 },
      { warehouseId: 'wh-spec-chem', physical: specStock, reserved: 0 },
    ],
  };
};

export const getInitialCatalogTab = (): 'reagents' | 'dishware' | 'other' => {
  if (typeof window === 'undefined') return 'reagents';
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab')?.toLowerCase();
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();

  if (tabParam === 'dishware' || path === 'dishware' || path.startsWith('store/dishware')) {
    return 'dishware';
  }
  if (tabParam === 'other' || path === 'other' || path.startsWith('store/other')) {
    return 'other';
  }
  return 'reagents';
};

export const DEFAULT_STAFF_ACCOUNTS: Array<StaffUser & { password: string }> = [
  {
    id: 'staff-mgr-1',
    fullName: 'Айгерим Касымова',
    email: 'manager@chemexpress.kz',
    role: 'manager',
    password: 'manager2026',
  },
  {
    id: 'staff-adm-1',
    fullName: 'Алдияр Кабдешев',
    email: 'admin@chemexpress.kz',
    role: 'admin',
    password: 'admin2026',
  },
];

const loadSavedStaffUser = (): StaffUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('chemexpress_staff_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
};

const saveStaffUserToStorage = (user: StaffUser | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem('chemexpress_staff_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chemexpress_staff_user');
    }
  } catch (e) {
    // ignore
  }
};

export const getInitialView = (): 'catalog' | 'manager' | 'admin' | 'login' => {
  if (typeof window === 'undefined') return 'catalog';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();

  const isLoginSlug = 
    path === '/login' ||
    path.startsWith('/login') ||
    params.get('view') === 'login' ||
    params.has('login') ||
    hash === '#login';

  if (isLoginSlug) {
    return 'login';
  }

  const staff = loadSavedStaffUser();

  const isAdminSlug = 
    path === '/admin' ||
    path.startsWith('/admin') ||
    params.get('view') === 'admin' ||
    params.has('admin') ||
    hash === '#admin';

  if (isAdminSlug) {
    if (!staff || staff.role !== 'admin') {
      window.history.replaceState({ view: 'login' }, '', '/login');
      return 'login';
    }
    return 'admin';
  }

  const isManagerSlug = 
    path === '/manager' ||
    path.startsWith('/manager') ||
    path === '/arm' ||
    path.startsWith('/arm') ||
    params.get('view') === 'manager' ||
    params.has('manager') ||
    hash === '#manager';

  if (isManagerSlug) {
    if (!staff) {
      window.history.replaceState({ view: 'login' }, '', '/login');
      return 'login';
    }
    return 'manager';
  }

  return 'catalog';
};

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-demo-8915',
    orderNumber: 'CX-2026-8915',
    type: 'invoice',
    status: 'invoice_issued',
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      bin: '080140012345',
      companyName: 'ТОО "КазХимСинтез"',
      kbe: '17',
      iik: 'KZ456010002003456789',
      bik: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      contactName: 'Алексей Бережной',
      contactPhone: '+7 (701) 450-89-22',
      contactEmail: 'procurement@kazchimsynthez.kz',
      deliveryAddress: 'г. Алматы, мкр. Алатау, ул. Ибрагимова, 1',
    },
    items: [
      {
        productId: 1,
        sku: 'TCI-E0297-25G',
        name: '1-этинил-1-циклогексанол',
        casNumber: '78-27-3',
        brand: 'TCI',
        packaging: '25g',
        quantity: 2,
        priceKzt: 19800,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
      {
        productId: 741192,
        sku: 'MKL-A801235-4L',
        name: 'Ацетонитрил для ВЭЖХ особой чистоты Ultra Gradient',
        casNumber: '75-05-8',
        brand: 'Macklin',
        packaging: '4.0L',
        quantity: 1,
        priceKzt: 42000,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
    ],
    subtotalKzt: 81600,
    vatKzt: 0,
    totalKzt: 81600,
    vatMode: 'none',
    isManagerConfirmed: false,
    clientMessage: 'Просьба приложить паспорта CoA/SDS к партии.',
    createdById: 'usr-client-1',
    organizationBin: '080140012345',
  },
  {
    id: 'ord-demo-7420',
    orderNumber: 'CX-2026-7420',
    type: 'quote',
    status: 'quote_sent',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    validUntil: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      bin: '140540023456',
      companyName: 'ТОО "ЛабФарм Трейд"',
      kbe: '17',
      iik: 'KZ897050001004567123',
      bik: 'CASPKZKA',
      bankName: 'АО "Kaspi Bank"',
      contactName: 'Динара Серикова',
      contactPhone: '+7 (777) 321-44-55',
      contactEmail: 'orders@labpharm.kz',
      deliveryAddress: 'г. Астана, ул. Достык, 18, БЦ "Москва"',
    },
    items: [
      {
        productId: 520326,
        sku: 'BSY-BR5589247-96T',
        name: 'Набор для ИФА на белок цилиндромы человека (CYLD)',
        casNumber: 'ELK-BIO-CYLD',
        brand: 'BSY',
        packaging: '96T',
        quantity: 1,
        priceKzt: 185000,
        vatRate: 0,
        warehouseId: 'wh-spec-chem',
      },
    ],
    subtotalKzt: 185000,
    vatKzt: 0,
    totalKzt: 185000,
    vatMode: 'none',
    isManagerConfirmed: true,
    managerComment: 'Сроки согласованы с производителем BSY, прямая авиадоставка в Астану.',
    createdById: 'usr-client-3',
    organizationBin: '140540023456',
  },
  {
    id: 'ord-demo-6310',
    orderNumber: 'CX-2026-6310',
    type: 'invoice',
    status: 'paid',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    client: {
      bin: '180240034567',
      companyName: 'ТОО "КазМунайАналитика"',
      kbe: '17',
      iik: 'KZ556010002008765432',
      bik: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      contactName: 'Руслан Ахметов',
      contactPhone: '+7 (702) 555-12-89',
      contactEmail: 'r.akhmetov@kma-lab.kz',
      deliveryAddress: 'г. Атырау, промзона Карабатан, Лабораторный корпус 4',
    },
    items: [
      {
        productId: 741192,
        sku: 'MKL-A801235-4L',
        name: 'Ацетонитрил для ВЭЖХ особой чистоты Ultra Gradient',
        casNumber: '75-05-8',
        brand: 'Macklin',
        packaging: '4.0L',
        quantity: 4,
        priceKzt: 42000,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
      {
        productId: 1,
        sku: 'TCI-E0297-25G',
        name: '1-этинил-1-циклогексанол',
        casNumber: '78-27-3',
        brand: 'TCI',
        packaging: '25g',
        quantity: 2,
        priceKzt: 19800,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
    ],
    subtotalKzt: 207600,
    vatKzt: 0,
    totalKzt: 219600,
    deliveryCostKzt: 12000,
    deliveryDays: '3-5 рабочих дней (по РК)',
    deliveryAddress: 'г. Атырау, промзона Карабатан, Лабораторный корпус 4',
    vatMode: 'none',
    isManagerConfirmed: true,
    managerComment: 'Оплата поступила по счету. Товар зарезервирован на Центральном складе Алматы, комплектуется к отправке курьерской службой.',
    createdById: 'usr-client-2',
    organizationBin: '180240034567',
  },
  {
    id: 'ord-demo-5120',
    orderNumber: 'CX-2026-5120',
    type: 'quote',
    status: 'quote_sent',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      bin: '190440098765',
      companyName: 'ТОО "КазБиоФарм"',
      kbe: '17',
      iik: 'KZ927050001009876543',
      bik: 'CASPKZKA',
      bankName: 'АО "Kaspi Bank"',
      contactName: 'Сауле Ибраева',
      contactPhone: '+7 (775) 432-11-22',
      contactEmail: 'procure@kazbiopharm.kz',
      deliveryAddress: 'г. Караганда, ул. Ермекова, 45',
    },
    items: [
      {
        productId: 201,
        sku: 'SW-F2440-500',
        name: 'Колба круглодонная со шлифом 24/40, 500 мл (Боросиликатное стекло 3.3)',
        casNumber: 'BORO-3.3-GLASS',
        brand: 'Synthware',
        packaging: '500 ml',
        quantity: 6,
        priceKzt: 14500,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
    ],
    subtotalKzt: 87000,
    vatKzt: 0,
    totalKzt: 87000,
    vatMode: 'none',
    isManagerConfirmed: false,
    clientMessage: 'Просьба согласовать возможность скидки 5% при заказе от 10 штук.',
    createdById: 'usr-client-4',
    organizationBin: '190440098765',
  },
  {
    id: 'ord-demo-4099',
    orderNumber: 'CX-2026-4099',
    type: 'request',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      bin: '050340056789',
      companyName: 'РГП на ПХВ "Национальный центр экспертизы"',
      kbe: '16',
      iik: 'KZ126010002001122334',
      bik: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      contactName: 'Марат Оспанов',
      contactPhone: '+7 (701) 987-65-43',
      contactEmail: 'expert@nce.gov.kz',
      deliveryAddress: 'г. Астана, ул. Желтоксан, 46',
    },
    items: [
      {
        productId: 301,
        sku: 'TCI-SPEC-ANALYTIC',
        name: 'Стандарт аналитический высокой чистоты (>99.8%) для хромато-масс-спектрометрии',
        casNumber: 'SPEC-GCMS-TCI',
        brand: 'TCI',
        packaging: '5 x 1 ml',
        quantity: 2,
        priceKzt: 72500,
        vatRate: 0,
        warehouseId: 'wh-spec-chem',
      },
    ],
    subtotalKzt: 145000,
    vatKzt: 0,
    totalKzt: 145000,
    vatMode: 'none',
    isManagerConfirmed: false,
    clientMessage: 'Запрос на подбор чистого стандарта TCI с паспортом CoA партии. Срочная потребность под проект.',
    createdById: 'usr-client-5',
    organizationBin: '050340056789',
  },
  {
    id: 'ord-demo-2901',
    orderNumber: 'CX-2026-2901',
    type: 'invoice',
    status: 'shipped',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    shippedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    client: {
      bin: '080140012345',
      companyName: 'ТОО "КазХимСинтез"',
      kbe: '17',
      iik: 'KZ456010002003456789',
      bik: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      contactName: 'Алексей Бережной',
      contactPhone: '+7 (701) 450-89-22',
      contactEmail: 'procurement@kazchimsynthez.kz',
      deliveryAddress: 'г. Алматы, мкр. Алатау, ул. Ибрагимова, 1',
    },
    items: [
      {
        productId: 741192,
        sku: 'MKL-A801235-4L',
        name: 'Ацетонитрил для ВЭЖХ особой чистоты Ultra Gradient',
        casNumber: '75-05-8',
        brand: 'Macklin',
        packaging: '4.0L',
        quantity: 3,
        priceKzt: 42000,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
    ],
    subtotalKzt: 126000,
    vatKzt: 0,
    totalKzt: 129500,
    deliveryCostKzt: 3500,
    deliveryDays: '1 рабочий день (г. Алматы)',
    deliveryAddress: 'г. Алматы, мкр. Алатау, ул. Ибрагимова, 1',
    vatMode: 'none',
    isManagerConfirmed: true,
    managerComment: 'Отгружено со склада Алматы по расходной накладной № ЭСФ-0941. Паспорт CoA выдан на руки курьеру.',
    createdById: 'usr-client-1',
    organizationBin: '080140012345',
  },
  {
    id: 'ord-demo-1840',
    orderNumber: 'CX-2026-1840',
    type: 'invoice',
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 24).toISOString(), // Previous month (September)
    paidAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    client: {
      bin: '190440098765',
      companyName: 'ТОО "КазБиоФарм"',
      kbe: '17',
      iik: 'KZ927050001009876543',
      bik: 'CASPKZKA',
      bankName: 'АО "Kaspi Bank"',
      contactName: 'Сауле Ибраева',
      contactPhone: '+7 (775) 432-11-22',
      contactEmail: 'procure@kazbiopharm.kz',
      deliveryAddress: 'г. Караганда, ул. Ермекова, 45',
    },
    items: [
      {
        productId: 201,
        sku: 'SW-F2440-500',
        name: 'Колба круглодонная со шлифом 24/40, 500 мл (Боросиликатное стекло 3.3)',
        casNumber: 'BORO-3.3-GLASS',
        brand: 'Synthware',
        packaging: '500 ml',
        quantity: 12,
        priceKzt: 14500,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
    ],
    subtotalKzt: 174000,
    vatKzt: 0,
    totalKzt: 179000,
    deliveryCostKzt: 5000,
    deliveryDays: '3-5 рабочих дней (по РК)',
    deliveryAddress: 'г. Караганда, ул. Ермекова, 45',
    vatMode: 'none',
    isManagerConfirmed: true,
    managerComment: 'Оплата получена. Товар скомплектован и доставлен в Караганду.',
    createdById: 'usr-client-4',
    organizationBin: '190440098765',
  },
  {
    id: 'ord-demo-1102',
    orderNumber: 'CX-2026-1102',
    type: 'invoice',
    status: 'shipped',
    createdAt: new Date(Date.now() - 86400000 * 55).toISOString(), // August
    paidAt: new Date(Date.now() - 86400000 * 52).toISOString(),
    shippedAt: new Date(Date.now() - 86400000 * 50).toISOString(),
    client: {
      bin: '080140012345',
      companyName: 'ТОО "КазХимСинтез"',
      kbe: '17',
      iik: 'KZ456010002003456789',
      bik: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      contactName: 'Алексей Бережной',
      contactPhone: '+7 (701) 450-89-22',
      contactEmail: 'procurement@kazchimsynthez.kz',
      deliveryAddress: 'г. Алматы, мкр. Алатау, ул. Ибрагимова, 1',
    },
    items: [
      {
        productId: 1,
        sku: 'TCI-E0297-25G',
        name: '1-этинил-1-циклогексанол',
        casNumber: '78-27-3',
        brand: 'TCI',
        packaging: '25g',
        quantity: 5,
        priceKzt: 19800,
        vatRate: 0,
        warehouseId: 'wh-almaty-central',
      },
    ],
    subtotalKzt: 99000,
    vatKzt: 0,
    totalKzt: 99000,
    deliveryCostKzt: 0,
    deliveryDays: 'Самовывоз со склада ChemExpress',
    deliveryAddress: 'Самовывоз со склада Алматы',
    vatMode: 'none',
    isManagerConfirmed: true,
    managerComment: 'Отгрузка по накладной закрыта. Самовывоз представителем.',
    createdById: 'usr-client-1',
    organizationBin: '080140012345',
  },
];

const loadSavedOrders = (): Order[] => {
  if (typeof window === 'undefined') return DEMO_ORDERS;
  try {
    const raw = localStorage.getItem('chemexpress_b2b_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing demo orders so all funnels (invoice, quote, request) are populated
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const missingDemo = DEMO_ORDERS.filter(d => !existingIds.has(d.id));
        if (missingDemo.length > 0) {
          const merged = [...parsed, ...missingDemo];
          saveOrdersToStorage(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEMO_ORDERS;
};

const saveOrdersToStorage = (orders: Order[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('chemexpress_b2b_orders', JSON.stringify(orders));
  } catch (e) {
    // ignore
  }
};

const loadSavedOrganizations = (): OrganizationEntity[] => {
  if (typeof window === 'undefined') return DEFAULT_ORGANIZATIONS;
  try {
    const raw = localStorage.getItem('chemexpress_organizations');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_ORGANIZATIONS;
};

const saveOrganizationsToStorage = (orgs: OrganizationEntity[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('chemexpress_organizations', JSON.stringify(orgs));
  } catch (e) {
    // ignore
  }
};

const loadSavedUsers = (): UserAccount[] => {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem('chemexpress_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_USERS;
};

const saveUsersToStorage = (users: UserAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('chemexpress_users', JSON.stringify(users));
  } catch (e) {
    // ignore
  }
};

const loadSavedAuthUser = (usersList: UserAccount[]): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('chemexpress_auth_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return usersList.find(u => u.email.toLowerCase() === parsed.email.toLowerCase()) || parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const saveAuthUserToStorage = (user: UserAccount | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem('chemexpress_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chemexpress_auth_user');
    }
  } catch (e) {
    // ignore
  }
};

const initialUsers = loadSavedUsers();
const initialOrgs = loadSavedOrganizations();
const initialAuthUser = loadSavedAuthUser(initialUsers);
const initialAuthOrg = initialAuthUser 
  ? initialOrgs.find(o => o.bin === initialAuthUser.organizationBin) || null 
  : null;

export const useStore = create<AppState>((set, get) => ({
  currentView: getInitialView(),
  setCurrentView: (view) => {
    let targetView = view;
    const staff = get().staffUser;

    if ((view === 'manager' || view === 'admin') && !staff) {
      targetView = 'login';
    } else if (view === 'admin' && staff?.role !== 'admin') {
      targetView = 'login';
    }

    set({ currentView: targetView });
    if (typeof window !== 'undefined') {
      if (targetView === 'login') {
        if (!window.location.pathname.toLowerCase().startsWith('/login')) {
          window.history.replaceState({ view: 'login' }, '', '/login');
        }
      } else if (targetView === 'admin') {
        if (!window.location.pathname.toLowerCase().startsWith('/admin')) {
          window.history.pushState({ view: 'admin' }, '', '/admin');
        }
      } else if (targetView === 'manager') {
        if (!window.location.pathname.toLowerCase().startsWith('/manager')) {
          window.history.pushState({ view: 'manager' }, '', '/manager');
        }
      } else {
        if (
          window.location.pathname.toLowerCase().startsWith('/manager') ||
          window.location.pathname.toLowerCase().startsWith('/admin') ||
          window.location.pathname.toLowerCase().startsWith('/login') ||
          window.location.pathname.toLowerCase().startsWith('/arm') ||
          window.location.search.includes('view=')
        ) {
          window.history.pushState({ view: 'catalog' }, '', '/');
        }
      }
    }
  },

  staffUser: loadSavedStaffUser(),
  loginStaff: (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = password.trim();

    const account = DEFAULT_STAFF_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPass
    );

    if (!account) {
      return {
        success: false,
        error: 'Неверный логин или пароль сотрудника ChemExpress.',
      };
    }

    const user: StaffUser = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      role: account.role,
    };

    saveStaffUserToStorage(user);
    set({ staffUser: user });
    return { success: true };
  },

  logoutStaff: () => {
    saveStaffUserToStorage(null);
    set({ staffUser: null });
    get().setCurrentView('login');
  },

  catalogTab: getInitialCatalogTab(),
  products: INITIAL_FALLBACK_PRODUCTS.map(p => enrichProduct(p)),
  totalProducts: 795158,
  currentPage: 1,
  pageSize: 20,
  searchQuery: '',
  isLoading: false,
  selectedBrand: 'all',
  selectedWarehouse: 'all',
  onlyInStock: false,

  inventoryStore: {},

  setCatalogTab: (tab, updateUrl = true) => {
    set({ catalogTab: tab, currentPage: 1, selectedBrand: 'all' });
    if (updateUrl && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab === 'reagents') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.pushState({ tab }, '', url.pathname + url.search);
    }
    get().fetchLiveProducts();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchLiveProducts();
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchLiveProducts();
  },

  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchLiveProducts();
  },

  setSelectedBrand: (brand) => {
    set({ selectedBrand: brand, currentPage: 1 });
    get().fetchLiveProducts();
  },

  setSelectedWarehouse: (wh) => {
    set({ selectedWarehouse: wh });
  },

  setOnlyInStock: (val) => {
    set({ onlyInStock: val });
  },

  fetchLiveProducts: async () => {
    const { catalogTab, searchQuery, selectedBrand, currentPage, pageSize, inventoryStore } = get();
    set({ isLoading: true });

    try {
      let url = '';
      let isOtherApi = false;

      if (catalogTab === 'reagents') {
        let queryStr = searchQuery.trim();
        if (selectedBrand !== 'all') {
          queryStr = queryStr ? `${queryStr} ${selectedBrand}` : selectedBrand;
        }
        url = `/api/products/search?search=${encodeURIComponent(queryStr)}&page=${currentPage}&page_size=${pageSize}`;
      } else if (catalogTab === 'dishware') {
        isOtherApi = true;
        let queryStr = searchQuery.trim();
        url = `/api/other_products/search?category_id=12&q=${encodeURIComponent(queryStr)}&page=${currentPage}&page_size=${pageSize}`;
      } else {
        // other: biology, antibodies, elisa kits
        isOtherApi = true;
        let queryStr = searchQuery.trim();
        url = `/api/other_products/search?q=${encodeURIComponent(queryStr)}&page=${currentPage}&page_size=${pageSize}`;
      }

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const rawItems: any[] = data.items || [];
      const total = typeof data.total === 'number' ? data.total : (catalogTab === 'reagents' ? 795158 : 27422);

      const enriched = rawItems.map((item: any) => {
        let rawChem: ChemProduct;
        if (isOtherApi) {
          rawChem = {
            id: item.id,
            title_ru: item.title || item.cat_no || (catalogTab === 'dishware' ? 'Лабораторная посуда' : 'Биологический реактив'),
            title_en: item.title || item.cat_no || 'Lab Product',
            product_code: item.cat_no || `ITM-${item.id}`,
            cas_number: item.cat_no ? `Кат. №: ${item.cat_no}` : 'N/A',
            purity: item.spec_text || (typeof item.category === 'object' && item.category?.name) || 'Lab Grade',
            storage: (typeof item.category === 'object' && (item.category?.name?.includes('ELISA') || item.category?.name?.includes('Antibody')))
              ? '-20°C / 2~8°C'
              : 'RT (15-25°C)',
            molecular_formula: (typeof item.category === 'object' && item.category?.name) || (catalogTab === 'dishware' ? 'Borosilicate 3.3' : 'Kit / Protein'),
            molecular_weight: 0,
            density: '-',
            quantity: item.quantity ? `${item.quantity} шт` : '1 шт',
            brand: typeof item.brand === 'object' && item.brand ? (item.brand.name || 'ChemExpress') : (typeof item.brand === 'string' ? item.brand : 'ChemExpress'),
            in_stock: Boolean(item.in_stock),
            stock_qty: item.stock_qty || null,
            price: item.price || null,
            main_image_url: item.main_image_url,
            category_name: typeof item.category === 'object' && item.category ? item.category.name : undefined,
            spec_text: item.spec_text,
            cat_no: item.cat_no,
          };
        } else {
          rawChem = item;
        }

        const cached = inventoryStore[rawChem.id];
        const product = enrichProduct(rawChem, cached);
        inventoryStore[rawChem.id] = product;
        return product;
      });

      set({
        products: enriched,
        totalProducts: total,
        isLoading: false,
        inventoryStore: { ...inventoryStore },
      });
    } catch {
      // If fetch failed, fallback gracefully to initial items
      set({ isLoading: false });
    }
  },

  cart: [],
  addToCart: (product, quantity = 1, warehouseId) => {
    const targetWh = warehouseId || product.stock.find(s => (s.physical - s.reserved) > 0)?.warehouseId || product.stock[0].warehouseId;
    const currentCart = get().cart;
    const existingIndex = currentCart.findIndex(item => item.product.id === product.id && item.warehouseId === targetWh);

    if (existingIndex > -1) {
      const updated = [...currentCart];
      updated[existingIndex].quantity += quantity;
      set({ cart: updated });
    } else {
      set({ cart: [...currentCart, { product, quantity, warehouseId: targetWh }] });
    }
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updated = get().cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    set({ cart: updated });
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.product.id !== productId) });
  },

  clearCart: () => set({ cart: [] }),

  isOrderDrawerOpen: false,
  orderDrawerType: 'invoice',
  openOrderDrawer: (type = 'invoice') => {
    set({ isOrderDrawerOpen: true, orderDrawerType: type });
  },
  closeOrderDrawer: () => {
    set({ isOrderDrawerOpen: false });
  },

  vatMode: 'none',
  setVatMode: (mode) => set({ vatMode: mode }),

  orders: loadSavedOrders(),

  // Auth & Organization state
  currentUser: initialAuthUser,
  currentOrganization: initialAuthOrg,
  users: initialUsers,
  organizations: initialOrgs,
  isAuthModalOpen: false,
  authModalMode: 'login',
  authCallbackAction: null,
  isOrgProfileModalOpen: false,

  login: (emailOrPhone: string) => {
    const query = emailOrPhone.toLowerCase().trim();
    const queryDigits = emailOrPhone.replace(/\D/g, '');
    const user = get().users.find(u => 
      u.email.toLowerCase() === query ||
      (queryDigits.length >= 10 && u.phone.replace(/\D/g, '').endsWith(queryDigits))
    );
    if (!user) {
      return false;
    }

    const org = get().organizations.find(o => o.bin === user.organizationBin) || null;
    set({
      currentUser: user,
      currentOrganization: org,
      isAuthModalOpen: false,
    });
    saveAuthUserToStorage(user);

    const callback = get().authCallbackAction;
    if (callback) {
      set({ authCallbackAction: null });
      callback();
    }
    return true;
  },

  register: (data: RegisterUserData) => {
    const existingUser = get().users.find(u => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existingUser) {
      return get().login(data.email);
    }

    const organizations = [...get().organizations];
    let org = organizations.find(o => o.bin === data.bin.trim());

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      roleInOrg: data.roleInOrg,
      organizationBin: data.bin.trim(),
      createdAt: new Date().toISOString(),
    };

    if (org) {
      if (!org.memberUserIds.includes(newUser.id)) {
        org.memberUserIds.push(newUser.id);
      }
    } else {
      org = {
        bin: data.bin.trim(),
        companyName: data.companyName,
        kbe: data.kbe || '17',
        iik: data.iik || '',
        bik: data.bik || 'HSBKKZKX',
        bankName: data.bankName || 'АО "Народный Банк Казахстана"',
        legalAddress: data.deliveryAddress || 'г. Алматы',
        deliveryAddress: data.deliveryAddress || '',
        memberUserIds: [newUser.id],
        createdAt: new Date().toISOString(),
      };
      organizations.push(org);
    }

    const updatedUsers = [...get().users, newUser];
    saveUsersToStorage(updatedUsers);
    saveOrganizationsToStorage(organizations);
    saveAuthUserToStorage(newUser);

    set({
      users: updatedUsers,
      organizations,
      currentUser: newUser,
      currentOrganization: org,
      isAuthModalOpen: false,
    });

    const callback = get().authCallbackAction;
    if (callback) {
      set({ authCallbackAction: null });
      callback();
    }
    return true;
  },

  logout: () => {
    saveAuthUserToStorage(null);
    set({
      currentUser: null,
      currentOrganization: null,
      isOrgProfileModalOpen: false,
    });
  },

  openAuthModal: (mode = 'login', onComplete) => {
    set({
      isAuthModalOpen: true,
      authModalMode: mode,
      authCallbackAction: onComplete || null,
    });
  },
  closeAuthModal: () => set({ isAuthModalOpen: false, authCallbackAction: null }),
  openOrgProfileModal: () => set({ isOrgProfileModalOpen: true }),
  closeOrgProfileModal: () => set({ isOrgProfileModalOpen: false }),

  isMyDocumentsOpen: false,
  openMyDocuments: () => set({ isMyDocumentsOpen: true }),
  closeMyDocuments: () => set({ isMyDocumentsOpen: false }),

  createOrder: ({ type, client, items, clientMessage, validDays = 5, vatMode }) => {
    const currentVatMode = vatMode || get().vatMode;
    const subtotal = items.reduce((sum, item) => sum + item.priceKzt * item.quantity, 0);
    const vat = currentVatMode === 'vat16' ? Math.round(subtotal * 0.16) : 0;
    const total = subtotal + vat;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CX-2026-${randomSuffix}`;

    const validDate = new Date();
    validDate.setDate(validDate.getDate() + validDays);

    const initialStatus = type === 'quote' ? 'quote_sent' : type === 'invoice' ? 'invoice_issued' : 'draft';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      type,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      validUntil: validDate.toISOString(),
      client,
      items,
      subtotalKzt: subtotal,
      vatKzt: vat,
      totalKzt: total,
      vatMode: currentVatMode,
      isManagerConfirmed: false,
      clientMessage,
      createdById: get().currentUser?.id,
      organizationBin: get().currentUser?.organizationBin || client.bin,
    };

    // Note: Stock reservation is NOT done automatically upon quote/invoice creation,
    // per client requirement: goods are reserved only after payment or manual confirmation.

    set(state => {
      const updated = [newOrder, ...state.orders];
      saveOrdersToStorage(updated);
      return {
        orders: updated,
        previewOrder: newOrder,
      };
    });

    get().addToast({
      type: 'success',
      title: type === 'invoice' ? 'Счёт сформирован' : 'КП сформировано',
      message: `№ ${orderNumber} • Сохранён в`,
      actionLabel: 'личном кабинете',
      onAction: () => {
        get().setPreviewOrder(null);
        if (get().currentUser && get().currentOrganization) {
          get().openOrgProfileModal();
        } else {
          get().openMyDocuments();
        }
      },
      duration: 10000,
    });

    return newOrder;
  },

  toggleOrderManagerConfirmation: (orderId) => {
    set(state => {
      const updatedOrders = state.orders.map(o => {
        if (o.id === orderId) {
          const isManagerConfirmed = !o.isManagerConfirmed;
          return {
            ...o,
            isManagerConfirmed,
            status: isManagerConfirmed ? 'reserved' as const : 'quote_sent' as const,
          };
        }
        return o;
      });
      saveOrdersToStorage(updatedOrders);
      const updatedPreview = state.previewOrder?.id === orderId 
        ? updatedOrders.find(o => o.id === orderId) || null 
        : state.previewOrder;
      return { orders: updatedOrders, previewOrder: updatedPreview };
    });
  },

  confirmOrderByManager: (orderId, details) => {
    let orderNum = '';
    set(state => {
      const updatedOrders = state.orders.map(o => {
        if (o.id === orderId) {
          orderNum = o.orderNumber;
          const deliveryCost = details?.deliveryCostKzt !== undefined ? details.deliveryCostKzt : (o.deliveryCostKzt || 0);
          const baseGoodsTotal = o.subtotalKzt + (o.vatKzt || 0);
          return {
            ...o,
            items: details?.items ?? o.items,
            isManagerConfirmed: true,
            deliveryAddress: details?.deliveryAddress ?? o.deliveryAddress ?? o.client.deliveryAddress,
            deliveryCity: details?.deliveryCity ?? o.deliveryCity,
            deliveryDays: details?.deliveryDays ?? o.deliveryDays,
            deliveryCostKzt: deliveryCost,
            managerComment: details?.managerComment ?? o.managerComment,
            totalKzt: baseGoodsTotal + deliveryCost,
          };
        }
        return o;
      });
      saveOrdersToStorage(updatedOrders);
      const updatedPreview = state.previewOrder?.id === orderId
        ? updatedOrders.find(o => o.id === orderId) || null
        : state.previewOrder;
      return { orders: updatedOrders, previewOrder: updatedPreview };
    });

    get().addToast({
      type: 'success',
      title: 'Заказ утверждён менеджером',
      message: `${orderNum ? `№ ${orderNum} • ` : ''}Условия поставки зафиксированы`,
      duration: 4000,
    });
  },

  convertQuoteToInvoice: (orderId) => {
    let orderNum = '';
    set(state => {
      const updatedOrders = state.orders.map(o => {
        if (o.id === orderId) {
          orderNum = o.orderNumber;
          return {
            ...o,
            type: 'invoice' as const,
            status: 'invoice_issued' as const,
          };
        }
        return o;
      });
      saveOrdersToStorage(updatedOrders);
      const updatedPreview = state.previewOrder?.id === orderId
        ? updatedOrders.find(o => o.id === orderId) || null
        : state.previewOrder;
      return { orders: updatedOrders, previewOrder: updatedPreview };
    });

    get().addToast({
      type: 'success',
      title: 'Счёт на оплату выставлен',
      message: `КП ${orderNum} успешно переведено в официальный Счёт`,
      duration: 5000,
    });
  },

  convertRequestToQuote: (orderId) => {
    let orderNum = '';
    set(state => {
      const updatedOrders = state.orders.map(o => {
        if (o.id === orderId) {
          orderNum = o.orderNumber;
          return {
            ...o,
            type: 'quote' as const,
            status: 'quote_sent' as const,
          };
        }
        return o;
      });
      saveOrdersToStorage(updatedOrders);
      const updatedPreview = state.previewOrder?.id === orderId
        ? updatedOrders.find(o => o.id === orderId) || null
        : state.previewOrder;
      return { orders: updatedOrders, previewOrder: updatedPreview };
    });

    get().addToast({
      type: 'success',
      title: 'Коммерческое предложение сформировано',
      message: `Запрос ${orderNum} успешно переведён в КП`,
      duration: 5000,
    });
  },

  cancelOrder: (orderId) => {
    get().updateOrderStatus(orderId, 'cancelled');
    get().addToast({
      type: 'info',
      title: 'Документ аннулирован',
      duration: 3500,
    });
  },

  updateOrderStatus: (orderId, newStatus) => {
    const orders = [...get().orders];
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return;

    const order = orders[index];
    const prevStatus = order.status;
    order.status = newStatus;

    if (newStatus === 'paid' && prevStatus !== 'paid') {
      order.paidAt = new Date().toISOString();
      const inventoryStore = { ...get().inventoryStore };

      order.items.forEach(item => {
        const prod = inventoryStore[item.productId];
        if (prod) {
          prod.stock = prod.stock.map(s => {
            if (s.warehouseId === item.warehouseId) {
              return {
                ...s,
                reserved: s.reserved + item.quantity,
              };
            }
            return s;
          });
          inventoryStore[item.productId] = prod;

          const mov: StockMovement = {
            id: `mov-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            type: 'reservation',
            productId: item.productId,
            productName: item.name,
            warehouseId: item.warehouseId,
            quantity: item.quantity,
            documentRef: order.orderNumber,
            comment: `Резервирование по факту оплаты счёта ${order.orderNumber}`,
            performedBy: 'Отдел продаж ChemExpress',
          };
          set(state => ({ movements: [mov, ...state.movements] }));
        }
      });

      const updatedProducts = get().products.map(p => inventoryStore[p.id] || p);
      set({ inventoryStore, products: updatedProducts });
    }

    if (newStatus === 'shipped' && prevStatus !== 'shipped') {
      order.shippedAt = new Date().toISOString();
      const inventoryStore = { ...get().inventoryStore };

      order.items.forEach(item => {
        const prod = inventoryStore[item.productId];
        if (prod) {
          prod.stock = prod.stock.map(s => {
            if (s.warehouseId === item.warehouseId) {
              return {
                ...s,
                physical: Math.max(0, s.physical - item.quantity),
                reserved: Math.max(0, s.reserved - item.quantity),
              };
            }
            return s;
          });
          inventoryStore[item.productId] = prod;

          const mov: StockMovement = {
            id: `mov-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            type: 'shipment',
            productId: item.productId,
            productName: item.name,
            warehouseId: item.warehouseId,
            quantity: item.quantity,
            documentRef: order.orderNumber,
            comment: `Отгрузка по счету ${order.orderNumber} (Расходная накладная)`,
            performedBy: 'Склад Chemexpress',
          };
          set(state => ({ movements: [mov, ...state.movements] }));
        }
      });

      const updatedProducts = get().products.map(p => inventoryStore[p.id] || p);
      set({ inventoryStore, products: updatedProducts });
    }

    saveOrdersToStorage(orders);
    set({ orders });
  },

  previewOrder: null,
  setPreviewOrder: (order) => set({ previewOrder: order }),

  movements: [],

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    const duration = toast.duration ?? 10000;
    set(state => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  getAvailableStock: (product, warehouseId) => {
    if (warehouseId) {
      const s = product.stock.find(entry => entry.warehouseId === warehouseId);
      return s ? Math.max(0, s.physical - s.reserved) : 0;
    }
    return product.stock.reduce((sum, s) => sum + Math.max(0, s.physical - s.reserved), 0);
  },
}));

// Synchronize back/forward browser navigation
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const tab = getInitialCatalogTab();
    if (useStore.getState().catalogTab !== tab) {
      useStore.getState().setCatalogTab(tab, false);
    }
    const view = getInitialView();
    if (useStore.getState().currentView !== view) {
      useStore.setState({ currentView: view });
    }
  });
}
