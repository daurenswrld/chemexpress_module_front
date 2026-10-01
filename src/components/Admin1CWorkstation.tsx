import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { WAREHOUSES } from '../data/mockData';
import type { OrderStatus, WarehouseId } from '../types';
import { 
  Building2, 
  Warehouse as WarehouseIcon, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Search, 
  Eye, 
  PlusCircle, 
  Layers
} from 'lucide-react';

export const Admin1CWorkstation: React.FC = () => {
  const {
    orders,
    products,
    movements,
    updateOrderStatus,
    toggleOrderManagerConfirmation,
    setPreviewOrder,
    addToast,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'stock' | 'movements'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWhFilter, setSelectedWhFilter] = useState<string>('all');

  // Quick Receipt modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptProductId, setReceiptProductId] = useState<number>(products[0]?.id || 1);
  const [receiptWarehouseId, setReceiptWarehouseId] = useState<WarehouseId>('wh-almaty-central');
  const [receiptQty, setReceiptQty] = useState(50);
  const [receiptDocRef, setReceiptDocRef] = useState('ПХ-2026-001');

  useEffect(() => {
    if (!isReceiptModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isReceiptModalOpen]);

  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.client.companyName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.client.bin.includes(orderSearch);

    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'invoice_issued':
        return (
          <span className="badge-status-issued">
            <Clock className="w-3 h-3 text-cyan-600" />
            Счёт выставлен (Резерв)
          </span>
        );
      case 'quote_sent':
        return (
          <span className="badge-status-issued">
            <FileSpreadsheet className="w-3 h-3 text-cyan-600" />
            КП отправлено
          </span>
        );
      case 'paid':
        return (
          <span className="badge-status-paid">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Оплачен бухгалтерией
          </span>
        );
      case 'shipped':
        return (
          <span className="badge-status-shipped">
            <Truck className="w-3 h-3 text-indigo-600" />
            Отгружен со склада
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge-status-cancelled">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Аннулирован
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            Черновик
          </span>
        );
    }
  };

  const handleManualReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === receiptProductId);
    if (!product) return;

    product.stock = product.stock.map(s => {
      if (s.warehouseId === receiptWarehouseId) {
        return { ...s, physical: s.physical + Number(receiptQty) };
      }
      return s;
    });

    const newMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'receipt' as const,
      productId: product.id,
      productName: product.title_ru,
      warehouseId: receiptWarehouseId,
      quantity: Number(receiptQty),
      documentRef: receiptDocRef,
      comment: `Приход товара по накладной ${receiptDocRef}`,
      performedBy: 'Главный бухгалтер / 1С',
    };

    useStore.setState(state => ({
      products: [...state.products],
      movements: [newMovement, ...state.movements],
    }));

    addToast({
      type: 'success',
      title: 'Оприходование проведено',
      message: `Поступило ${receiptQty} ${product.quantity || 'шт'} "${product.title_ru}" на склад.`,
    });

    setIsReceiptModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1C Workstation Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-700 font-bold">
              1C:Предприятие 8.3 • Бухгалтерия & Склад
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Рабочее место бухгалтера и менеджера по продажам
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Журнал выписанных счетов, контроль резервов (Доступно = Факт − Резерв) и списание при отгрузке.
          </p>
        </div>

        <button
          onClick={() => setIsReceiptModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Оприходование (Приход 1С)</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Журнал документов (Счета и КП)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-800 text-cyan-300 font-mono">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'stock'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          <span>Складской учёт и остатки (Матрица 1С)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('movements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'movements'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Регистр движений и проводок</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-800 text-cyan-300 font-mono">
            {movements.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ORDERS & INVOICES JOURNAL */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Поиск по номеру счета, организации или БИН..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-cyan-600"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Статус:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg outline-none"
              >
                <option value="all">Все документы</option>
                <option value="invoice_issued">Счёт выставлен</option>
                <option value="quote_sent">КП отправлено</option>
                <option value="paid">Оплачен</option>
                <option value="shipped">Отгружен</option>
                <option value="cancelled">Аннулирован</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <th className="p-3 w-32 font-mono">Номер док.</th>
                  <th className="p-3 w-28">Дата</th>
                  <th className="p-3">Контрагент / БИН</th>
                  <th className="p-3 w-28 text-right font-mono">Без НДС</th>
                  <th className="p-3 w-28 text-right font-mono">НДС</th>
                  <th className="p-3 w-32 text-right font-mono">Итого, ₸</th>
                  <th className="p-3 w-48">Статус</th>
                  <th className="p-3 w-44 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Документы не найдены
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="p-3 text-gray-500 font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900 leading-snug">
                          {order.client.companyName}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          БИН: {order.client.bin}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-gray-600">
                        {order.subtotalKzt.toLocaleString('ru-RU')}
                      </td>
                      <td className="p-3 text-right font-mono text-gray-500">
                        {order.vatKzt.toLocaleString('ru-RU')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {order.totalKzt.toLocaleString('ru-RU')} ₸
                      </td>
                      <td className="p-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleOrderManagerConfirmation(order.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              order.isManagerConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                            }`}
                            title="Переключить подтверждение РОП/менеджером"
                          >
                            {order.isManagerConfirmed ? 'Подтверждено РОП' : 'Предварительное'}
                          </button>

                          <button
                            onClick={() => setPreviewOrder(order)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                            title="Открыть печатную форму счета (А4 / Печать)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === 'invoice_issued' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'paid')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all"
                            >
                              Оплачен
                            </button>
                          )}

                          {order.status === 'paid' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all"
                            >
                              Отгрузить
                            </button>
                          )}
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

      {/* TAB 2: WAREHOUSE & STOCK MATRIX */}
      {activeSubTab === 'stock' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WarehouseIcon className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-gray-900">
                Сводная матрица складских запасов и резервов
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Склад:</span>
              <select
                value={selectedWhFilter}
                onChange={(e) => setSelectedWhFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg outline-none"
              >
                <option value="all">Все склады компании</option>
                {WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <th className="p-3 w-32 font-mono">Код / Артикул</th>
                  <th className="p-3">Номенклатура химреактива</th>
                  <th className="p-3 w-28 font-mono">CAS</th>
                  <th className="p-3 w-20">Бренд</th>
                  <th className="p-3 w-40">Склад размещения</th>
                  <th className="p-3 w-28 text-right font-mono">Физич. остаток</th>
                  <th className="p-3 w-28 text-right font-mono text-amber-700">В резерве 1С</th>
                  <th className="p-3 w-32 text-right font-mono text-emerald-700 font-bold">Доступно к заказу</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {products.flatMap(product =>
                  product.stock
                    .filter(s => selectedWhFilter === 'all' || s.warehouseId === selectedWhFilter)
                    .map(stockEntry => {
                      const wh = WAREHOUSES.find(w => w.id === stockEntry.warehouseId);
                      const free = Math.max(0, stockEntry.physical - stockEntry.reserved);
                      return (
                        <tr key={`${product.id}-${stockEntry.warehouseId}`} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-gray-900">
                            {product.product_code || `ID-${product.id}`}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-gray-900">{product.title_ru}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{product.molecular_formula} • {product.quantity}</div>
                          </td>
                          <td className="p-3 font-mono text-gray-600">
                            {product.cas_number || '—'}
                          </td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                              {product.brand}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600 text-[11px]">
                            {wh?.name}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-gray-800">
                            {stockEntry.physical} шт
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-amber-600">
                            {stockEntry.reserved} шт
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">
                            {free} шт
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK MOVEMENTS & REGISTERS */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-900">
              Регистр накопления: Складские проводки и движения товаров
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <th className="p-3 w-36 font-mono">Дата и время</th>
                  <th className="p-3 w-36">Тип операции</th>
                  <th className="p-3">Товар / Номенклатура</th>
                  <th className="p-3 w-40">Склад</th>
                  <th className="p-3 w-24 text-right font-mono">Кол-во</th>
                  <th className="p-3 w-32 font-mono">Документ-основание</th>
                  <th className="p-3">Комментарий / Ответственный</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      Регистр складских проводок пуст. Проводки фиксируются автоматически при оприходовании (Приход 1С), резервировании под счёт или списании при отгрузке.
                    </td>
                  </tr>
                ) : (
                  movements.map(m => {
                    const wh = WAREHOUSES.find(w => w.id === m.warehouseId);
                    const isReceipt = m.type === 'receipt';
                    const isShipment = m.type === 'shipment';
                    const isReservation = m.type === 'reservation';

                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-gray-500">
                        {new Date(m.timestamp).toLocaleString('ru-RU')}
                      </td>
                      <td className="p-3">
                        {isReceipt && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Приход товара (+)
                          </span>
                        )}
                        {isShipment && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Расход / Отгрузка (−)
                          </span>
                        )}
                        {isReservation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Резерв под счет
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        {m.productName}
                      </td>
                      <td className="p-3 text-gray-600 text-[11px]">
                        {wh?.name}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {m.quantity}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-cyan-700 font-bold">
                        {m.documentRef || '—'}
                      </td>
                      <td className="p-3 text-gray-600 text-[11px]">
                        <div>{m.comment}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{m.performedBy}</div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK RECEIPT MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-600" />
              Оприходование товара (Приход 1С)
            </h3>

            <form onSubmit={handleManualReceipt} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Товар</label>
                <select
                  value={receiptProductId}
                  onChange={(e) => setReceiptProductId(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title_ru} ({p.product_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Склад размещения</label>
                <select
                  value={receiptWarehouseId}
                  onChange={(e) => setReceiptWarehouseId(e.target.value as WarehouseId)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none"
                >
                  {WAREHOUSES.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Количество</label>
                  <input
                    type="number"
                    min="1"
                    value={receiptQty}
                    onChange={(e) => setReceiptQty(Number(e.target.value))}
                    className="w-full p-2 font-mono bg-white border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Номер накладной</label>
                  <input
                    type="text"
                    value={receiptDocRef}
                    onChange={(e) => setReceiptDocRef(e.target.value)}
                    className="w-full p-2 font-mono bg-white border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
                >
                  Провести приход
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
