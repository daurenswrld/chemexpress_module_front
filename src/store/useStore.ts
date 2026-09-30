import { create } from 'zustand';
import type { 
  ChemProduct, 
  InventoryItem, 
  Order, 
  OrderItem, 
  WarehouseId, 
  OrderType, 
  StockMovement, 
  ClientEntity 
} from '../types';
import { INITIAL_FALLBACK_PRODUCTS } from '../data/mockData';

export interface CartItem {
  product: InventoryItem;
  quantity: number;
  warehouseId: WarehouseId;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppState {
  currentView: 'catalog' | 'admin';
  setCurrentView: (view: 'catalog' | 'admin') => void;

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

  // Orders / 1C Documents
  orders: Order[];
  createOrder: (orderData: {
    type: OrderType;
    client: ClientEntity;
    items: OrderItem[];
    clientMessage?: string;
    validDays?: number;
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;

  // Document preview modal
  previewOrder: Order | null;
  setPreviewOrder: (order: Order | null) => void;

  // Stock movements (1C register)
  movements: StockMovement[];

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

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
  const isPrecursor = raw.title_ru?.toLowerCase().includes('кислота соляная') || raw.title_ru?.toLowerCase().includes('метанол');

  const seed = (raw.id * 13) % 100;
  const centralStock = seed > 20 ? Math.floor(seed / 2) : 0;
  const specStock = isSpecial ? 15 : seed > 50 ? 10 : 0;
  const precursorStock = isPrecursor ? 40 : 0;

  return {
    ...raw,
    computedPrice: price,
    stock: [
      { warehouseId: 'wh-almaty-central', physical: centralStock, reserved: Math.floor(centralStock * 0.2) },
      { warehouseId: 'wh-spec-chem', physical: specStock, reserved: 0 },
      { warehouseId: 'wh-precursors', physical: precursorStock, reserved: isPrecursor ? 10 : 0 },
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

export const useStore = create<AppState>((set, get) => ({
  currentView: 'catalog',
  setCurrentView: (view) => set({ currentView: view }),

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

  orders: [],

  createOrder: ({ type, client, items, clientMessage, validDays = 7 }) => {
    const subtotal = items.reduce((sum, item) => sum + item.priceKzt * item.quantity, 0);
    const vat = Math.round(subtotal * 0.12);
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
      clientMessage,
    };

    // 1C Reservation logic
    if (type === 'invoice' || type === 'quote') {
      const inventoryStore = { ...get().inventoryStore };
      items.forEach(orderItem => {
        const prod = inventoryStore[orderItem.productId];
        if (prod) {
          prod.stock = prod.stock.map(s => {
            if (s.warehouseId === orderItem.warehouseId) {
              return { ...s, reserved: s.reserved + orderItem.quantity };
            }
            return s;
          });
          inventoryStore[orderItem.productId] = prod;

          // Record movement
          const mov: StockMovement = {
            id: `mov-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            type: 'reservation',
            productId: orderItem.productId,
            productName: orderItem.name,
            warehouseId: orderItem.warehouseId,
            quantity: orderItem.quantity,
            documentRef: orderNumber,
            comment: `Резервирование по документу ${orderNumber}`,
            performedBy: '1C:Автоматический контур',
          };
          set(state => ({ movements: [mov, ...state.movements] }));
        }
      });

      // Update current products list view
      const updatedProducts = get().products.map(p => inventoryStore[p.id] || p);
      set({ inventoryStore, products: updatedProducts });
    }

    set(state => ({
      orders: [newOrder, ...state.orders],
      previewOrder: newOrder,
    }));

    get().addToast({
      type: 'success',
      title: type === 'invoice' ? 'Счёт сформирован' : type === 'quote' ? 'КП подготовлено' : 'Запрос отправлен',
      message: `Документ ${orderNumber} создан. Зафиксирован резерв на складе Chemexpress.`,
    });

    return newOrder;
  },

  updateOrderStatus: (orderId, newStatus) => {
    const orders = [...get().orders];
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return;

    const order = orders[index];
    const prevStatus = order.status;
    order.status = newStatus;

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

    set({ orders });
    get().addToast({
      type: 'info',
      title: 'Статус изменен',
      message: `Документ ${order.orderNumber} переведен в статус: ${newStatus}`,
    });
  },

  previewOrder: null,
  setPreviewOrder: (order) => set({ previewOrder: order }),

  movements: [],

  toasts: [],
  addToast: () => {},
  removeToast: () => {},

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
  });
}
