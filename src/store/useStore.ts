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
import { MOCK_CLIENTS, INITIAL_FALLBACK_PRODUCTS } from '../data/mockData';

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
  products: InventoryItem[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  selectedBrand: string;
  selectedWarehouse: string;
  onlyInStock: boolean;

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
  const isSpecial = raw.storage?.includes('2~8') || raw.storage?.includes('−20') || raw.title_ru?.includes('ИФА');
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

export const useStore = create<AppState>((set, get) => ({
  currentView: 'catalog',
  setCurrentView: (view) => set({ currentView: view }),

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
  },

  setSelectedWarehouse: (wh) => {
    set({ selectedWarehouse: wh });
  },

  setOnlyInStock: (val) => {
    set({ onlyInStock: val });
  },

  fetchLiveProducts: async () => {
    const { searchQuery, currentPage, pageSize, inventoryStore } = get();
    set({ isLoading: true });

    try {
      const url = `/api/products/search?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&page_size=${pageSize}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const rawItems: ChemProduct[] = data.items || [];
      const total = data.total || 795158;

      const enriched = rawItems.map(item => {
        const cached = inventoryStore[item.id];
        const product = enrichProduct(item, cached);
        inventoryStore[item.id] = product;
        return product;
      });

      set({
        products: enriched,
        totalProducts: total,
        isLoading: false,
        inventoryStore: { ...inventoryStore },
      });
    } catch {
      // If offline or fetch failed, fallback gracefully to initial items
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

    get().addToast({
      type: 'success',
      title: 'Добавлено в заявку',
      message: `${product.title_ru} (${quantity} ${product.quantity || 'шт'}) добавлен в спецификацию.`,
    });
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

  orders: [
    {
      id: 'ord-101',
      orderNumber: 'CX-2026-0042',
      type: 'invoice',
      status: 'invoice_issued',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
      client: MOCK_CLIENTS[0],
      items: [
        {
          productId: 1,
          sku: 'TCI-E0297-25G',
          name: '1-Этинил-1-циклогексанол',
          casNumber: '78-27-3',
          brand: 'TCI',
          packaging: '25g',
          quantity: 2,
          priceKzt: 19800,
          vatRate: 0.12,
          warehouseId: 'wh-almaty-central',
        },
      ],
      subtotalKzt: 39600,
      vatKzt: 4752,
      totalKzt: 44352,
      managerComment: 'Счет выписан, товар зарезервирован на 7 дней в 1С',
    },
  ],

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

  movements: [
    {
      id: 'mov-1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'receipt',
      productId: 1,
      productName: '1-Этинил-1-циклогексанол',
      warehouseId: 'wh-almaty-central',
      quantity: 50,
      documentRef: 'ПХ-2026-0901',
      comment: 'Поступление от TCI (Токио, Япония)',
      performedBy: 'Складской оператор',
    },
  ],

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
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
