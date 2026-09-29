// Core Domain Types for Chemexpress B2B & 1C Module

export interface ChemProduct {
  id: number;
  title_ru: string;
  title_en: string;
  product_code: string;
  cas_number: string;
  purity: string;
  storage: string;
  molecular_formula: string;
  molecular_weight: number;
  density: string;
  quantity: string;
  brand: string;
  in_stock: boolean;
  stock_qty: number | null;
  price: number | null;
}

export type WarehouseId = 'wh-almaty-central' | 'wh-spec-chem' | 'wh-precursors';

export interface Warehouse {
  id: WarehouseId;
  name: string;
  city: string;
  address: string;
  isSpecialPermitRequired?: boolean;
}

export interface StockEntry {
  warehouseId: WarehouseId;
  physical: number;
  reserved: number;
}

export interface InventoryItem extends ChemProduct {
  computedPrice: number;
  stock: StockEntry[];
}

export type OrderType = 'invoice' | 'quote' | 'request';

export type OrderStatus =
  | 'draft'          // Черновик
  | 'reserved'       // Зарезервировано в 1С
  | 'quote_sent'     // КП отправлено
  | 'invoice_issued' // Счет выставлен
  | 'paid'           // Оплачен
  | 'shipped'        // Отгружен
  | 'cancelled';     // Аннулирован

export interface ClientEntity {
  bin: string;
  companyName: string;
  kbe?: string;
  iik: string;
  bik: string;
  bankName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryAddress: string;
}

export interface OrderItem {
  productId: number;
  sku: string;
  name: string;
  casNumber: string;
  brand: string;
  packaging: string;
  quantity: number;
  priceKzt: number;
  vatRate: number;
  warehouseId: WarehouseId;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  createdAt: string;
  validUntil?: string;
  client: ClientEntity;
  items: OrderItem[];
  subtotalKzt: number;
  vatKzt: number;
  totalKzt: number;
  managerComment?: string;
  clientMessage?: string;
  paidAt?: string;
  shippedAt?: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  type: 'receipt' | 'reservation' | 'release_reserve' | 'shipment';
  productId: number;
  productName: string;
  warehouseId: WarehouseId;
  quantity: number;
  documentRef?: string;
  comment: string;
  performedBy: string;
}
