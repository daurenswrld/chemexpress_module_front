import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Order, OrderStatus } from '../types';
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
  CreditCard, 
  Package, 
  Receipt, 
  FileText, 
  Calendar, 
  X, 
  LogOut, 
  RotateCcw, 
  MapPin 
} from 'lucide-react';

export const Admin1CWorkstation: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    toggleOrderManagerConfirmation,
    confirmOrderByManager,
    setPreviewOrder,
    setCurrentView,
    staffUser,
    logoutStaff,
  } = useStore();

  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmationFilter, setConfirmationFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  // Manager confirmation modal state
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [managerDeliveryAddress, setManagerDeliveryAddress] = useState('');
  const [managerDeliveryCity, setManagerDeliveryCity] = useState('');
  const [managerDeliveryDays, setManagerDeliveryDays] = useState('1-2 рабочих дня');
  const [managerDeliveryCost, setManagerDeliveryCost] = useState<number>(0);
  const [managerComment, setManagerComment] = useState('');

  const openConfirmModal = (order: Order) => {
    setConfirmingOrder(order);
    setManagerDeliveryAddress(order.deliveryAddress || order.client.deliveryAddress || '');
    setManagerDeliveryCity(order.deliveryCity || '');
    setManagerDeliveryDays(order.deliveryDays || '1-2 рабочих дня (со склада Алматы)');
    setManagerDeliveryCost(order.deliveryCostKzt || 0);
    setManagerComment(order.managerComment || 'Наличие партии подтверждено. Паспорт качества (CoA) подготовлен.');
  };

  const handleSaveConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingOrder) return;
    confirmOrderByManager(confirmingOrder.id, {
      deliveryAddress: managerDeliveryAddress,
      deliveryCity: managerDeliveryCity,
      deliveryDays: managerDeliveryDays,
      deliveryCostKzt: Number(managerDeliveryCost) || 0,
      managerComment: managerComment,
    });
    setConfirmingOrder(null);
  };

  useEffect(() => {
    if (!confirmingOrder) return;
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
  }, [confirmingOrder]);

  // Order Counts
  const unconfirmedCount = orders.filter(o => !o.isManagerConfirmed).length;
  const confirmedCount = orders.filter(o => o.isManagerConfirmed && o.status !== 'paid' && o.status !== 'shipped').length;
  const paidCount = orders.filter(o => o.status === 'paid').length;

  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.client.companyName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.client.bin.includes(orderSearch);

    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchConfirmation = 
      confirmationFilter === 'all' 
        ? true 
        : confirmationFilter === 'pending' 
        ? !order.isManagerConfirmed 
        : order.isManagerConfirmed;

    return matchSearch && matchStatus && matchConfirmation;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'invoice_issued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 whitespace-nowrap">
            <Receipt className="w-3 h-3 text-sky-600 shrink-0" />
            <span>Счёт выставлен</span>
          </span>
        );
      case 'quote_sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
            <span>КП сформировано</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Оплачен (Резерв)</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap">
            <Truck className="w-3 h-3 text-indigo-600 shrink-0" />
            <span>Отгружен</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Аннулирован</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span>Черновик</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ChemExpress" className="h-6 w-auto object-contain shrink-0" />
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
              Кабинет менеджера
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 leading-none">
              Реестр заказов и согласование документов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {staffUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Панель администратора"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-navy-900" />
              <span className="hidden md:inline">Управление</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>В каталог</span>
          </button>

          {staffUser && (
            <div className="inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
              <div className="w-6 h-6 rounded-md bg-navy-900 text-white font-semibold flex items-center justify-center text-[11px]">
                {staffUser.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <div className="font-medium text-slate-900 text-xs leading-none">{staffUser.fullName}</div>
                <div className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                  {staffUser.role === 'admin' ? 'Администратор' : 'Менеджер'}
                </div>
              </div>
              <button
                type="button"
                onClick={logoutStaff}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="Выйти"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 KPI Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: All Orders */}
        <div 
          onClick={() => {
            setStatusFilter('all');
            setConfirmationFilter('all');
          }}
          className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
            confirmationFilter === 'all' && statusFilter === 'all'
              ? 'bg-white border-slate-900 ring-1 ring-slate-900 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Все заказы</span>
            <Package className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {orders.length}
            </span>
            {confirmationFilter === 'all' && statusFilter === 'all' && (
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Активен
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Pending Confirmation */}
        <div 
          onClick={() => {
            setConfirmationFilter('pending');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
            confirmationFilter === 'pending'
              ? 'bg-white border-amber-500 ring-1 ring-amber-500 shadow-xs'
              : unconfirmedCount > 0
              ? 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={unconfirmedCount > 0 ? 'text-amber-800' : 'text-slate-500'}>
              Требуют подтверждения
            </span>
            <Clock className={`w-3.5 h-3.5 ${unconfirmedCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              unconfirmedCount > 0 ? 'text-amber-900' : 'text-slate-900'
            }`}>
              {unconfirmedCount}
            </span>
            {confirmationFilter === 'pending' ? (
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Активен
              </span>
            ) : unconfirmedCount > 0 ? (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                новые
              </span>
            ) : null}
          </div>
        </div>

        {/* Card 3: Confirmed */}
        <div 
          onClick={() => {
            setConfirmationFilter('confirmed');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
            confirmationFilter === 'confirmed'
              ? 'bg-white border-emerald-600 ring-1 ring-emerald-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Подтверждены</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-800 tabular-nums">
              {confirmedCount}
            </span>
            {confirmationFilter === 'confirmed' && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                Активен
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Paid / Reserved */}
        <div 
          onClick={() => {
            setConfirmationFilter('all');
            setStatusFilter('paid');
          }}
          className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
            statusFilter === 'paid'
              ? 'bg-white border-blue-600 ring-1 ring-blue-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Оплачены</span>
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-blue-800 tabular-nums">
              {paidCount}
            </span>
            {statusFilter === 'paid' && (
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                Активен
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Orders & Invoices Journal */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
          {/* Table Filters Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Поиск по номеру счёта, организации или БИН..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-navy-900 font-medium transition-colors"
              />
              {orderSearch && (
                <button
                  type="button"
                  onClick={() => setOrderSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Очистить поиск"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Manager Confirmation Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Проверка:</span>
                <select
                  value={confirmationFilter}
                  onChange={(e) => setConfirmationFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-navy-900"
                >
                  <option value="all">Все документы</option>
                  <option value="pending">Ожидают подтверждения ({unconfirmedCount})</option>
                  <option value="confirmed">Подтверждённые менеджером</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Статус:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-navy-900"
                >
                  <option value="all">Все статусы</option>
                  <option value="invoice_issued">Счёт выставлен</option>
                  <option value="quote_sent">КП сформировано</option>
                  <option value="paid">Оплачен (В резерве)</option>
                  <option value="shipped">Отгружен</option>
                  <option value="cancelled">Аннулирован</option>
                </select>
              </div>

              {/* Reset button if any filter is active */}
              {(confirmationFilter !== 'all' || statusFilter !== 'all' || orderSearch !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearch('');
                    setConfirmationFilter('all');
                    setStatusFilter('all');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="Сбросить все примененные фильтры"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Сбросить ({filteredOrders.length} из {orders.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 w-32 font-mono whitespace-nowrap">Документ</th>
                  <th className="p-3.5 w-24 whitespace-nowrap">Дата</th>
                  <th className="p-3.5 min-w-[200px]">Контрагент / БИН</th>
                  <th className="p-3.5 w-28 text-right font-mono whitespace-nowrap">Сумма, ₸</th>
                  <th className="p-3.5 w-36 whitespace-nowrap">Согласование</th>
                  <th className="p-3.5 w-44 whitespace-nowrap">Статус</th>
                  <th className="p-3.5 w-52 text-right whitespace-nowrap">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-semibold text-slate-600">Документы не найдены</div>
                        <div className="text-[11px] text-slate-400">
                          {orderSearch ? 'Попробуйте изменить поисковый запрос или сбросить фильтры.' : 'Новые счета и КП будут появляться здесь автоматически.'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const isInvoice = order.type === 'invoice';

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Document Number */}
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            className="font-mono font-bold text-navy-900 hover:text-blue-600 hover:underline cursor-pointer block text-left"
                            title="Открыть официальный бланк документа"
                          >
                            {order.orderNumber}
                          </button>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {isInvoice ? 'Счёт на оплату' : 'Коммерческое предл.'}
                          </span>
                        </td>

                        {/* 2. Date */}
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </td>

                        {/* 3. Client details */}
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
                          {order.clientMessage && (
                            <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1 rounded border border-slate-200">
                              «{order.clientMessage}»
                            </div>
                          )}
                        </td>

                        {/* 4. Total Amount */}
                        <td className="p-3.5 text-right font-mono">
                          <div className="font-bold text-slate-900 text-xs">
                            {order.totalKzt.toLocaleString('ru-RU')} ₸
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.vatMode === 'vat16' ? 'с НДС 16%' : 'без НДС'}
                          </div>
                        </td>

                        {/* 5. Manager Confirmation Badge */}
                        <td className="p-3.5 whitespace-nowrap">
                          {order.isManagerConfirmed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Подтверждено</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                              <span>Требует проверки</span>
                            </span>
                          )}
                        </td>

                        {/* 6. Order Status */}
                        <td className="p-3.5 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>

                        {/* 7. Manager Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Manager Confirmation Button */}
                            {order.isManagerConfirmed ? (
                              <button
                                onClick={() => openConfirmModal(order)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                title="Условия доставки утверждены. Нажмите для редактирования"
                              >
                                Утверждено (изм.)
                              </button>
                            ) : (
                              <button
                                onClick={() => openConfirmModal(order)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-2xs"
                                title="Уточнить место, срок и стоимость доставки и утвердить КП"
                              >
                                Утвердить
                              </button>
                            )}

                            {/* Mark Paid (Triggers Stock Reservation) - Strictly only AFTER manager confirmation */}
                            {order.isManagerConfirmed && order.status !== 'paid' && order.status !== 'shipped' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'paid')}
                                className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                                title="Зафиксировать оплату (товар перейдет в резерв на складе)"
                              >
                                Оплачен
                              </button>
                            )}

                            {/* Mark Shipped (Deducts Physical Stock) */}
                            {order.status === 'paid' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="px-2.5 py-1 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                                title="Отгрузить со склада (списать фактический остаток)"
                              >
                                Отгрузить
                              </button>
                            )}

                            {/* View Document A4 Sheet */}
                            <button
                              onClick={() => setPreviewOrder(order)}
                              className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Просмотреть официальный документ для печати"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      {/* MANAGER ORDER CONFIRMATION & DELIVERY MODAL */}
      {confirmingOrder && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Утверждение заказа менеджером</span>
                    <span className="font-mono text-cyan-400">({confirmingOrder.orderNumber})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {confirmingOrder.client.companyName} • БИН {confirmingOrder.client.bin}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveConfirmation} className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Order summary box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Сумма позиций ({confirmingOrder.items.length} наим.):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {confirmingOrder.subtotalKzt.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                  <span>Контакт: <strong>{confirmingOrder.client.contactName}</strong></span>
                  <span>Тел: <strong>{confirmingOrder.client.contactPhone}</strong></span>
                  <span>Email: <strong>{confirmingOrder.client.contactEmail}</strong></span>
                </div>
              </div>

              {/* 1. Delivery Address */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Место (адрес) доставки</span>
                </label>
                <input
                  type="text"
                  required
                  value={managerDeliveryAddress}
                  onChange={(e) => setManagerDeliveryAddress(e.target.value)}
                  placeholder="г. Алматы, пр. Райымбека, 120 / терминал покупателя"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium focus:border-navy-900 focus:bg-white transition-colors"
                />
              </div>

              {/* 2. Delivery Timeframe */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Срок поставки / готовности к отгрузке</span>
                </label>
                <input
                  type="text"
                  required
                  value={managerDeliveryDays}
                  onChange={(e) => setManagerDeliveryDays(e.target.value)}
                  placeholder="например: 1-2 рабочих дня (со склада Алматы)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium focus:border-navy-900 focus:bg-white transition-colors"
                />
                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                        managerDeliveryDays === preset
                          ? 'bg-navy-900 text-white border-navy-900'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Delivery Cost */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Стоимость доставки (₸)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={managerDeliveryCost}
                    onChange={(e) => setManagerDeliveryCost(Number(e.target.value))}
                    className="w-full p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono font-bold focus:border-navy-900 focus:bg-white transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">₸</span>
                </div>
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[
                    { label: '0 ₸ (Включена / Самовывоз)', val: 0 },
                    { label: '3 500 ₸ (Город Алматы)', val: 3500 },
                    { label: '5 000 ₸ (Область)', val: 5000 },
                    { label: '12 000 ₸ (Регионы РК)', val: 12000 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setManagerDeliveryCost(item.val)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                        managerDeliveryCost === item.val
                          ? 'bg-navy-900 text-white border-navy-900'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Manager Note */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Примечание менеджера (будет отображено в КП / Счете)
                </label>
                <textarea
                  rows={2}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Например: Наличие подтверждено. Паспорт качества CoA приложен к отгрузочным документам."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium focus:border-navy-900 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Delivery API Automation Roadmap Notice */}
              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-cyan-950 leading-relaxed">
                  <div className="font-bold text-cyan-900">Будущая автоматизация доставки:</div>
                  <div>
                    Архитектура готова к подключению API Яндекс Доставки / СДЭК для автоматического расчета тарифов по весу и вызова курьера прямо из этой формы.
                  </div>
                </div>
              </div>

              {/* Total preview with delivery */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Итоговая сумма КП с доставкой:</span>
                <span className="font-mono text-base font-black text-navy-950">
                  {((confirmingOrder.subtotalKzt + (confirmingOrder.vatKzt || 0)) + (Number(managerDeliveryCost) || 0)).toLocaleString('ru-RU')} ₸
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                {confirmingOrder.isManagerConfirmed ? (
                  <button
                    type="button"
                    onClick={() => {
                      toggleOrderManagerConfirmation(confirmingOrder.id);
                      setConfirmingOrder(null);
                    }}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer border border-rose-200 text-xs"
                  >
                    Снять утверждение
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingOrder(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Утвердить КП и зафиксировать условия</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
