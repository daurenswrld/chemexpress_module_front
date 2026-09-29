import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { OrderType, ClientEntity, OrderItem } from '../types';
import { 
  X, 
  Receipt, 
  FileText, 
  MessageSquare, 
  Building2, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export const OrderDrawer: React.FC = () => {
  const {
    isOrderDrawerOpen,
    closeOrderDrawer,
    orderDrawerType,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrder,
  } = useStore();

  const [activeTab, setActiveTab] = useState<OrderType>(orderDrawerType || 'invoice');

  // Client form - clean production state
  const [bin, setBin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Banking details (for invoices)
  const [showBanking, setShowBanking] = useState(false);
  const [iik, setIik] = useState('');
  const [bik, setBik] = useState('');
  const [bankName, setBankName] = useState('');

  const [clientComment, setClientComment] = useState('');
  const [validDays, setValidDays] = useState(14);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOrderDrawerOpen) return;
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
  }, [isOrderDrawerOpen]);

  if (!isOrderDrawerOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.computedPrice * item.quantity, 0);
  const vat = Math.round(subtotal * 0.12);
  const total = subtotal + vat;

  // Phone input mask (+7 7XX XXX-XX-XX)
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    let formatted = '+7 ';
    if (raw.length > 1) {
      const rest = raw.startsWith('7') || raw.startsWith('8') ? raw.slice(1) : raw;
      if (rest.length > 0) formatted += `(${rest.slice(0, 3)}`;
      if (rest.length >= 3) formatted += `) ${rest.slice(3, 6)}`;
      if (rest.length >= 6) formatted += `-${rest.slice(6, 8)}`;
      if (rest.length >= 8) formatted += `-${rest.slice(8, 10)}`;
    }
    setContactPhone(raw.length <= 1 ? '+7 ' : formatted);
  };

  const handleBinChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 12);
    setBin(clean);
    if (formError) setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Спецификация заявки пуста. Выберите реактивы из каталога.');
      return;
    }

    if (!bin || bin.length !== 12) {
      setFormError('БИН/ИИН организации должен содержать ровно 12 цифр.');
      return;
    }

    if (!companyName.trim()) {
      setFormError('Укажите официальное наименование организации (ТОО, АО, ИП).');
      return;
    }

    if (!contactName.trim()) {
      setFormError('Укажите ФИО контактного лица.');
      return;
    }

    if (!contactPhone || contactPhone.length < 16) {
      setFormError('Укажите корректный номер телефона в формате +7 (7XX) XXX-XX-XX.');
      return;
    }

    if (!contactEmail || !contactEmail.includes('@') || !contactEmail.includes('.')) {
      setFormError('Укажите действующий рабочий e-mail для отправки документов.');
      return;
    }

    const finalAddress = deliveryType === 'pickup' 
      ? 'Самовывоз со склада ChemExpress: Алматинская обл., с. Отеген Батыр, ул. Мусрепова, 5а'
      : (deliveryAddress.trim() || 'Адрес доставки согласовывается с менеджером');

    const client: ClientEntity = {
      bin,
      companyName: companyName.trim(),
      iik: iik.trim() || 'По согласованию',
      bik: bik.trim() || 'По согласованию',
      bankName: bankName.trim() || 'Банк второго уровня РК',
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      deliveryAddress: finalAddress,
    };

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      sku: item.product.product_code || `ID-${item.product.id}`,
      name: item.product.title_ru,
      casNumber: item.product.cas_number,
      brand: item.product.brand,
      packaging: item.product.quantity || '1 шт',
      quantity: item.quantity,
      priceKzt: item.product.computedPrice,
      vatRate: 0.12,
      warehouseId: item.warehouseId,
    }));

    createOrder({
      type: activeTab,
      client,
      items: orderItems,
      clientMessage: clientComment,
      validDays,
    });

    clearCart();
    closeOrderDrawer();
  };

  return (
    <div className="fixed inset-0 !m-0 z-50 overflow-hidden no-print">
      <div 
        onClick={closeOrderDrawer}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/60">
                  B2B Документооборот
                </span>
                <span className="text-xs text-slate-400 font-mono">•</span>
                <span className="text-xs text-slate-500 font-medium">ТОО «Chemexpress»</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Оформление спецификации и заявки
              </h2>
            </div>
            <button
              onClick={closeOrderDrawer}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Scenario Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('invoice')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'invoice'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>1. Счёт на оплату (1С)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quote')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quote'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>2. Официальное КП</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'request'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>3. Запрос менеджеру</span>
            </button>
          </div>

          {/* Error alert */}
          {formError && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            
            {/* Section: Customer details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                  Реквизиты организации (Покупатель РК)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">12 цифр БИН</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="label-b2b">
                    БИН / ИИН организации <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bin}
                      maxLength={12}
                      onChange={(e) => handleBinChange(e.target.value)}
                      placeholder="12-значный БИН"
                      className="input-b2b font-mono"
                      required
                    />
                    {bin.length === 12 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="label-b2b">
                    Наименование организации <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ТОО / АО / ИП / НИИ..."
                    className="input-b2b"
                    required
                  />
                </div>

                <div>
                  <label className="label-b2b">
                    ФИО представителя <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Фамилия Имя Отчество"
                    className="input-b2b"
                    required
                  />
                </div>

                <div>
                  <label className="label-b2b">
                    Контактный телефон <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+7 (7XX) XXX-XX-XX"
                    className="input-b2b font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label-b2b">
                    Рабочий e-mail для отправки счетов и документов <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="b2b@company.kz"
                    className="input-b2b"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-600" />
                  Способ получения товара
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-cyan-600 bg-cyan-50/50 text-cyan-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Самовывоз со склада</span>
                    {deliveryType === 'pickup' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal mt-1 leading-snug">
                    с. Отеген Батыр, ул. Мусрепова, 5а
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-cyan-600 bg-cyan-50/50 text-cyan-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Доставка по РК</span>
                    {deliveryType === 'delivery' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal mt-1 leading-snug">
                    Курьер / ТК в регионы Казахстана
                  </div>
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">
                    Адрес доставки (город, улица, номер лаборатории/склада)
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Например: г. Астана, пр. Туран 53, корпус 2"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Optional Banking Details Accordion for Invoices */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowBanking(!showBanking)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Банковские реквизиты (ИИК / БИК)</span>
                  <span className="text-[10px] text-slate-400 font-normal">(опционально)</span>
                </span>
                {showBanking ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showBanking && (
                <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ИИК (Номер счета IBAN KZ...)</label>
                    <input
                      type="text"
                      value={iik}
                      onChange={(e) => setIik(e.target.value.toUpperCase())}
                      placeholder="KZ88601000..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">БИК банка</label>
                    <input
                      type="text"
                      value={bik}
                      onChange={(e) => setBik(e.target.value.toUpperCase())}
                      placeholder="HSBKKZKX"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Наименование обслуживающего банка</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="АО «Народный Банк Казахстана»..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Validity selector for Quote */}
            {activeTab === 'quote' && (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-700 font-semibold">Срок фиксации цен в КП:</span>
                <div className="flex gap-1.5">
                  {[7, 14, 30].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValidDays(d)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                        validDays === d 
                          ? 'bg-cyan-600 text-white shadow-xs' 
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {d} дней
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Items Specification List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Спецификация к заказу ({cart.length})</span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:underline font-normal"
                  >
                    Очистить спецификацию
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl text-xs">
                  Спецификация пуста. Добавьте химреактивы из каталога кнопкой «В заявку».
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div 
                      key={item.product.id}
                      className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200/50">
                            {item.product.product_code || `ID-${item.product.id}`}
                          </span>
                          {item.product.cas_number && (
                            <span className="font-mono text-[10px] text-slate-400">
                              CAS {item.product.cas_number}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 truncate mt-1">
                          {item.product.title_ru}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.product.computedPrice.toLocaleString('ru-RU')} ₸ / {item.product.quantity || 'шт'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-mono font-bold text-slate-900 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Удалить позицию"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">
                Примечание / Требования к спецификации
              </label>
              <textarea
                rows={2}
                value={clientComment}
                onChange={(e) => setClientComment(e.target.value)}
                placeholder="Требования к паспортам CoA/SDS, особые условия фасовки, сроки отгрузки..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
              />
            </div>

            {/* Footer Summary & Submit */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-auto">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Сумма по спецификации (без НДС):</span>
                  <span className="font-mono font-semibold">{subtotal.toLocaleString('ru-RU')} ₸</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>НДС 12% (Республика Казахстан):</span>
                  <span className="font-mono font-semibold">{vat.toLocaleString('ru-RU')} ₸</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold">
                  <span className="text-slate-900">Итого к оплате с НДС:</span>
                  <span className="font-mono text-cyan-800 text-base font-extrabold">
                    {total.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-50/70 border border-cyan-200/80 text-[11px] text-cyan-950 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                <span>При выставлении счёта позиции автоматически бронируются на складе в 1С.</span>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>
                  {activeTab === 'invoice'
                    ? 'Сформировать счёт (1С) и забронировать остатки'
                    : activeTab === 'quote'
                    ? 'Сформировать официальное КП с печатью'
                    : 'Отправить заявку в отдел продаж'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
