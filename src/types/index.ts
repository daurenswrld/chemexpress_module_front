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
  main_image_url?: string;
  category_name?: string;
  spec_text?: string;
  cat_no?: string;
}

export type WarehouseId = 'wh-almaty-central' | 'wh-spec-chem';

export interface Warehouse {
  id: WarehouseId;
  name: string;
  city: string;
  address: string;
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
  | 'reserved'       // Зарезервировано
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
  name: string; // Official localized Russian compliant name (primary)
  nameRu?: string;
  nameEn?: string;
  nameKz?: string;
  casNumber: string;
  brand: string;
  packaging: string;
  quantity: number;
  priceKzt: number;
  vatRate: number;
  warehouseId: WarehouseId;
}

export type OrgUserRole = 'owner' | 'procurement' | 'accountant' | 'member';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleInOrg: OrgUserRole;
  organizationBin: string;
  createdAt: string;
}

export interface OrganizationEntity {
  bin: string;
  companyName: string;
  kbe?: string;
  iik: string;
  bik: string;
  bankName: string;
  legalAddress: string;
  deliveryAddress: string;
  memberUserIds: string[];
  createdAt: string;
}

export interface RegisterUserData {
  fullName: string;
  email: string;
  phone: string;
  roleInOrg: OrgUserRole;
  bin: string;
  companyName: string;
  kbe?: string;
  iik?: string;
  bik?: string;
  bankName?: string;
  deliveryAddress?: string;
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
  vatMode?: 'none' | 'vat16';
  isManagerConfirmed?: boolean;
  managerComment?: string;
  clientMessage?: string;
  paidAt?: string;
  shippedAt?: string;
  createdById?: string;
  organizationBin?: string;
  deliveryCity?: string;
  deliveryAddress?: string;
  deliveryDays?: string;
  deliveryCostKzt?: number;
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

export type StaffRole = 'manager' | 'admin';

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

