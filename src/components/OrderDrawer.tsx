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
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Clock,
  Download,
  ShieldCheck
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
    currentUser,
    currentOrganization,
    organizations,
    openAuthModal,
    vatMode, 
    setVatMode
  } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<OrderType>(orderDrawerType || 'invoice');

  // Client form state
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
  const [validDays] = useState(5);
  const [formError, setFormError] = useState<string | null>(null);

  // Prefill form from authenticated organization & user
  useEffect(() => {
    if (currentUser && currentOrganization) {
      setBin(currentOrganization.bin);
      setCompanyName(currentOrganization.companyName);
      setContactName(currentUser.fullName);
      setContactPhone(currentUser.phone);
      setContactEmail(currentUser.email);
      if (currentOrganization.deliveryAddress) {
        setDeliveryAddress(currentOrganization.deliveryAddress);
        setDeliveryType('delivery');
      }
      if (currentOrganization.iik) {
        setIik(currentOrganization.iik);
        setShowBanking(true);
      }
      if (currentOrganization.bik) {
        setBik(currentOrganization.bik);
      }
      if (currentOrganization.bankName) {
        setBankName(currentOrganization.bankName);
      }
    }
  }, [currentUser, currentOrganization, isOrderDrawerOpen, step]);

  // Sync activeTab with orderDrawerType from trigger and reset step to 1
  useEffect(() => {
    if (isOrderDrawerOpen) {
      if (orderDrawerType) {
        setActiveTab(orderDrawerType);
      }
      setStep(1);
      setFormError(null);
    }
  }, [isOrderDrawerOpen, orderDrawerType]);

  // Strict guard: transitioning to Step 2 always requires authenticated user
  useEffect(() => {
    if (isOrderDrawerOpen && step === 2 && !currentUser) {
      setStep(1);
      openAuthModal('login', () => {
        setStep(2);
      });
    }
  }, [isOrderDrawerOpen, step, currentUser, openAuthModal]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOrderDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOrderDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOrderDrawerOpen, closeOrderDrawer]);

  if (!isOrderDrawerOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.computedPrice * item.quantity, 0);
  const vatRate = vatMode === 'vat16' ? 0.16 : 0;
  const vat = Math.round(subtotal * vatRate);
  const total = subtotal + vat;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

    if (clean.length === 12) {
      const foundOrg = organizations.find(o => o.bin === clean);
      if (foundOrg) {
        setCompanyName(foundOrg.companyName);
        if (foundOrg.iik) {
          setIik(foundOrg.iik);
          setShowBanking(true);
        }
        if (foundOrg.bik) setBik(foundOrg.bik);
        if (foundOrg.bankName) setBankName(foundOrg.bankName);
        if (foundOrg.deliveryAddress) {
          setDeliveryAddress(foundOrg.deliveryAddress);
          setDeliveryType('delivery');
        }
      }
    }
  };

  const handleProceedToStep2 = () => {
    if (cart.length === 0) {
      setFormError('Спецификация пуста. Выберите необходимые позиции из каталога.');
      return;
    }
    setFormError(null);

    // If user is not logged in, prompt authentication/registration before proceeding to Step 2
    if (!currentUser) {
      openAuthModal('login', () => {
        setStep(2);
      });
      return;
    }

    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Спецификация заявки пуста. Выберите реактивы из каталога.');
      setStep(1);
      return;
    }

    if (!bin || bin.length !== 12) {
      setFormError('БИН/ИИН организации должен содержать ровно 12 цифр.');
      return;
    }

    if (!companyName.trim()) {
      setFormError('Укажите официальное наименование организации (ТОО, АО, ИП, НИИ).');
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
      vatRate: vatRate,
      warehouseId: item.warehouseId,
    }));

    createOrder({
      type: activeTab,
      client,
      items: orderItems,
      clientMessage: clientComment,
      validDays,
      vatMode,
    });

    clearCart();
    closeOrderDrawer();
  };

  const handleExportCsv = () => {
    if (cart.length === 0) return;

    // Headers with BOM for proper cyrillic display in Microsoft Excel
    const headers = vatMode === 'vat16' ? [
      '№',
      'Артикул',
      'CAS номер',
      'Наименование товара',
      'Бренд',
      'Фасовка',
      'Количество',
      'Цена без НДС (KZT)',
      'НДС 16% (KZT)',
      'Цена с НДС (KZT)',
      'Сумма с НДС (KZT)'
    ] : [
      '№',
      'Артикул',
      'CAS номер',
      'Наименование товара',
      'Бренд',
      'Фасовка',
      'Количество',
      'Цена без НДС (KZT)',
      'НДС',
      'Сумма (KZT)'
    ];

    const rows = cart.map((item, index) => {
      const priceNet = item.product.computedPrice;
      const rowVat = Math.round(priceNet * vatRate);
      const priceWithVat = priceNet + rowVat;
      const totalRow = vatMode === 'vat16' ? priceWithVat * item.quantity : priceNet * item.quantity;
      const sanitize = (str: string | undefined | null) => 
        str ? `"${str.replace(/"/g, '""')}"` : '""';

      if (vatMode === 'vat16') {
        return [
          index + 1,
          sanitize(item.product.product_code || `ID-${item.product.id}`),
          sanitize(item.product.cas_number || 'N/A'),
          sanitize(item.product.title_ru),
          sanitize(item.product.brand || 'ChemExpress'),
          sanitize(item.product.quantity || '1 шт'),
          item.quantity,
          priceNet,
          rowVat,
          priceWithVat,
          totalRow
        ].join(';');
      }

      return [
        index + 1,
        sanitize(item.product.product_code || `ID-${item.product.id}`),
        sanitize(item.product.cas_number || 'N/A'),
        sanitize(item.product.title_ru),
        sanitize(item.product.brand || 'ChemExpress'),
        sanitize(item.product.quantity || '1 шт'),
        item.quantity,
        priceNet,
        'Без НДС',
        totalRow
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Спецификация_ChemExpress_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 !m-0 z-50 overflow-y-auto no-print flex items-center justify-center p-3 sm:p-5 md:p-6">
      {/* Dark backdrop with smooth blur */}
      <div 
        onClick={closeOrderDrawer}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-200" 
      />

      {/* Centered Modal Studio Card */}
      <div className="relative w-full max-w-3xl lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 my-auto">
        
        {/* Top Modal Header */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {step === 1 ? 'Спецификация и цель' : 'Реквизиты и подтверждение'}
              </h2>
              <span className="text-[11px] font-mono font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-full border border-navy-100">
                {step === 1 ? 'Шаг 1 из 2' : 'Шаг 2 из 2'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
              <span>{totalItemsCount} {totalItemsCount === 1 ? 'позиция' : (totalItemsCount > 1 && totalItemsCount < 5) ? 'позиции' : 'позиций'}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono font-bold text-slate-900">{total.toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeOrderDrawer}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Закрыть (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="shrink-0 grid grid-cols-2 bg-slate-50 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 px-5 flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer border-b-2 ${
              step === 1 
                ? 'border-navy-900 text-navy-900 bg-white font-bold' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
              step === 1 ? 'bg-navy-900 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {step === 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
            </span>
            <span>1. Состав и формат документа</span>
          </button>

          <button
            type="button"
            onClick={handleProceedToStep2}
            disabled={cart.length === 0}
            className={`py-3 px-5 flex items-center justify-center gap-2 font-semibold transition-all border-b-2 ${
              step === 2 
                ? 'border-navy-900 text-navy-900 bg-white font-bold' 
                : 'border-transparent text-slate-400 disabled:opacity-50 cursor-pointer'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
              step === 2 ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              2
            </span>
            <span>2. Реквизиты и доставка</span>
          </button>
        </div>

        {/* Error notification banner */}
        {formError && (
          <div className="shrink-0 mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* ================= STEP 1: Состав и выбор документа ================= */}
        {step === 1 && (
          <>
            {/* Scrollable Step 1 Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 animate-in fade-in duration-150">
              
              {/* Purpose Selection (3 Interactive B2B Cards) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Какой документ подготовить?
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Выберите требуемый сценарий</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Invoice */}
                  <div
                    onClick={() => setActiveTab('invoice')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      activeTab === 'invoice'
                        ? 'border-navy-900 bg-navy-50/70 ring-2 ring-navy-900/10 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`p-2 rounded-xl ${activeTab === 'invoice' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Receipt className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-bold text-xs text-slate-900">Счёт на оплату</div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-1">
                        Счёт на оплату по выбранным позициям
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Quote */}
                  <div
                    onClick={() => setActiveTab('quote')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      activeTab === 'quote'
                        ? 'border-navy-900 bg-navy-50/70 ring-2 ring-navy-900/10 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`p-2 rounded-xl ${activeTab === 'quote' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-bold text-xs text-slate-900">Коммерческое предложение</div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-1">
                        Автоматически сформированное КП
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Request */}
                  <div
                    onClick={() => setActiveTab('request')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      activeTab === 'request'
                        ? 'border-navy-900 bg-navy-50/70 ring-2 ring-navy-900/10 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`p-2 rounded-xl ${activeTab === 'request' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-bold text-xs text-slate-900">Запрос менеджеру</div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-1">
                        Индивидуальная фасовка, оптовый заказ, технические вопросы
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Specification List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Позиции в спецификации ({cart.length})</span>
                  {cart.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-navy-900 bg-navy-50 hover:bg-navy-100 border border-navy-200/80 rounded-lg transition-colors cursor-pointer"
                        title="Скачать спецификацию в формате Excel / CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Экспорт в Excel (.csv)</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer ml-1"
                      >
                        Очистить всё
                      </button>
                    </div>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 border border-dashed border-slate-300 rounded-2xl text-xs space-y-2 bg-slate-50/50">
                    <p className="font-bold text-slate-700 text-sm">Спецификация пуста</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Вернитесь в каталог и нажмите кнопку «В заявку» у нужных позиций.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {cart.map(item => {
                      const itemTotal = item.product.computedPrice * item.quantity;
                      const itemTotalWithVat = vatMode === 'vat16' ? Math.round(itemTotal * 1.16) : itemTotal;

                      return (
                        <div 
                          key={item.product.id}
                          className="p-3.5 bg-slate-50/90 hover:bg-slate-100/60 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-navy-200/80">
                                {item.product.product_code || `ID-${item.product.id}`}
                              </span>
                              {item.product.cas_number && item.product.cas_number !== 'N/A' && (
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                                  {item.product.cas_number.startsWith('Кат.') || item.product.cas_number.startsWith('Cat.') 
                                    ? item.product.cas_number 
                                    : `CAS ${item.product.cas_number}`}
                                </span>
                              )}
                              {item.product.brand && (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {item.product.brand}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 truncate mt-1 text-[13px]">
                              {item.product.title_ru}
                            </h4>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {item.product.computedPrice.toLocaleString('ru-RU')} ₸ / {item.product.quantity || '1 шт'}
                            </div>
                          </div>

                          <div className="flex items-center gap-3.5 shrink-0">
                            {/* Quantity Stepper */}
                            <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Уменьшить"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-mono font-bold text-xs text-slate-900 select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Увеличить"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right min-w-[85px]">
                              <div className="font-mono font-bold text-slate-900 text-xs">
                                {itemTotalWithVat.toLocaleString('ru-RU')} ₸
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                {vatMode === 'vat16' ? 'с НДС 16%' : 'без НДС'}
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Удалить позицию"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Sticky Step 1 Bottom Bar (Clean Horizontal Layout on Desktop) */}
            <div className="shrink-0 p-5 sm:px-6 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1.5 text-xs">
                {/* VAT Mode Switch for ИП на ОУР */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Режим НДС (ИП на ОУР):</span>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setVatMode('none')}
                      className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        vatMode === 'none' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Без НДС
                    </button>
                    <button
                      type="button"
                      onClick={() => setVatMode('vat16')}
                      className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        vatMode === 'vat16' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      С НДС (16%)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  {vatMode === 'vat16' ? (
                    <>
                      <span>Без НДС: <strong className="text-slate-800 font-semibold tabular-nums">{subtotal.toLocaleString('ru-RU')} ₸</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>НДС 16%: <strong className="text-slate-800 font-semibold tabular-nums">{vat.toLocaleString('ru-RU')} ₸</strong></span>
                    </>
                  ) : (
                    <span>Итого по базовым ценам номенклатуры (без НДС)</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-slate-900 font-bold text-xs uppercase tracking-wide">
                    {vatMode === 'vat16' ? 'Итого с НДС:' : 'Всего к оплате:'}
                  </span>
                  <span className="text-navy-900 text-xl font-bold tracking-tight tabular-nums">
                    {total.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={cart.length === 0}
                className="py-3 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] whitespace-nowrap"
              >
                <span>Перейти к реквизитам</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ================= STEP 2: Реквизиты и подтверждение ================= */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-150">
            
            {/* Scrollable Step 2 Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              
              {/* Back navigation & demo auto-fill */}
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Вернуться к составу заказа</span>
                </button>

                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Реквизиты загружены из профиля</span>
                </div>
              </div>

              {/* Selected document type confirmation chip */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Документ на выходе:</span>
                  <strong className="text-navy-900 font-bold">
                    {activeTab === 'invoice' ? 'Счёт на оплату по выбранным позициям' : activeTab === 'quote' ? 'Официальное коммерческое предложение' : 'Спецификация заказа'}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-navy-800 hover:underline font-semibold cursor-pointer shrink-0"
                >
                  Изменить
                </button>
              </div>

              {/* Organization & User Linkage Banner */}
              {currentUser && currentOrganization && (
                <div className="p-3.5 rounded-xl bg-navy-50/80 border border-navy-200/90 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-navy-950">
                        {currentUser.fullName} • <span className="font-normal text-navy-800">{currentOrganization.companyName}</span>
                      </div>
                      <div className="text-[11px] text-navy-600 font-mono">
                        БИН: {currentOrganization.bin} • Документ закрепится за вашей организацией
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login', () => setStep(2))}
                    className="text-[11px] text-navy-800 hover:text-navy-950 font-bold underline cursor-pointer shrink-0"
                  >
                    Сменить
                  </button>
                </div>
              )}

              {/* Section: Organization details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-navy-800" />
                    Реквизиты организации (Покупатель РК)
                  </span>
                  <span className="text-[11px] font-mono">
                    {bin.length === 12 ? (
                      <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        БИН проверен
                      </span>
                    ) : (
                      <span className="text-slate-400">введено {bin.length}/12 цифр</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* BIN Input */}
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
                        placeholder="12 цифр БИН"
                        className={`input-b2b font-mono transition-colors ${bin.length === 12 ? 'border-emerald-500 ring-1 ring-emerald-500/20' : ''}`}
                        required
                        autoFocus
                      />
                      {bin.length === 12 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                      )}
                    </div>
                  </div>

                  {/* Company Name */}
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

                  {/* Contact Person */}
                  <div>
                    <label className="label-b2b">
                      ФИО контактного лица <span className="text-rose-500">*</span>
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

                  {/* Phone */}
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

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="label-b2b">
                      Рабочий e-mail для отправки документов <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="zakup@company.kz"
                      className="input-b2b"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Delivery Method */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-navy-800" />
                    Способ получения
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-navy-900 bg-navy-50/70 text-navy-950 font-bold ring-2 ring-navy-900/10'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Самовывоз</span>
                      {deliveryType === 'pickup' && <CheckCircle2 className="w-4 h-4 text-navy-900" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-1 leading-snug">
                      Алматы, с. Отеген Батыр, ул. Мусрепова, 5а
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-navy-900 bg-navy-50/70 text-navy-950 font-bold ring-2 ring-navy-900/10'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Доставка по РК</span>
                      {deliveryType === 'delivery' && <CheckCircle2 className="w-4 h-4 text-navy-900" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-1 leading-snug">
                      Курьерская доставка до дверей лаборатории
                    </div>
                  </button>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="animate-in fade-in duration-150">
                    <label className="label-b2b">
                      Адрес доставки (город, улица, номер склада/лаборатории) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Например: г. Астана, пр. Туран 53, лаборатория №2"
                      className="input-b2b"
                      required={deliveryType === 'delivery'}
                    />
                  </div>
                )}
              </div>

              {/* Validity info for Quote and Invoice */}
              {(activeTab === 'quote' || activeTab === 'invoice') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-navy-800" />
                      <span className="text-slate-700 font-semibold">Срок действия документа:</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-white px-3 py-1 rounded-lg border border-slate-300 text-navy-950">
                      5 календарных дней
                    </div>
                  </div>

                  {activeTab === 'invoice' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-navy-800 shrink-0 mt-0.5" />
                      <span>Выставление счёта не означает автоматический резерв товара. Резервирование позиций осуществляется после поступления оплаты на расчётный счёт.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Banking details accordion (optional) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBanking(!showBanking)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Банковские реквизиты (ИИК / БИК)</span>
                    <span className="text-[10px] text-slate-400 font-normal">(опционально)</span>
                  </span>
                  {showBanking ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showBanking && (
                  <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-200 animate-in fade-in duration-150">
                    <div>
                      <label className="label-b2b">ИИК (IBAN KZ...)</label>
                      <input
                        type="text"
                        value={iik}
                        onChange={(e) => setIik(e.target.value.toUpperCase())}
                        placeholder="KZ88601000..."
                        className="input-b2b font-mono"
                      />
                    </div>

                    <div>
                      <label className="label-b2b">БИК банка</label>
                      <input
                        type="text"
                        value={bik}
                        onChange={(e) => setBik(e.target.value.toUpperCase())}
                        placeholder="HSBKKZKX"
                        className="input-b2b font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="label-b2b">Обслуживающий банк</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="АО «Народный Банк Казахстана»..."
                        className="input-b2b"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order note / comment */}
              <div>
                <label className="label-b2b">
                  Примечание к заказу
                </label>
                <textarea
                  rows={2}
                  value={clientComment}
                  onChange={(e) => setClientComment(e.target.value)}
                  placeholder="Особые требования к фасовке, паспортам качества CoA/SDS, график отгрузок..."
                  className="input-b2b resize-none"
                />
              </div>

            </div>

            {/* Sticky Step 2 Bottom Bar */}
            <div className="shrink-0 p-5 sm:px-6 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5 text-xs">
                <div className="text-slate-500">
                  {activeTab === 'invoice' ? (
                    <span className="text-slate-700 font-medium inline-flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-navy-800" />
                      Счёт на оплату
                    </span>
                  ) : activeTab === 'quote' ? (
                    <span className="text-navy-900 font-medium inline-flex items-center gap-1">
                      <FileText className="w-3 h-3 text-navy-800" />
                      Предварительное коммерческое предложение
                    </span>
                  ) : (
                    <span>Заявка менеджеру</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-slate-900 font-bold text-xs uppercase tracking-wide">
                    {vatMode === 'vat16' ? 'Всего к оплате (с НДС 16%):' : 'Всего к оплате (без НДС):'}
                  </span>
                  <span className="text-navy-900 text-xl font-bold tracking-tight tabular-nums">
                    {total.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="py-3 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] whitespace-nowrap"
              >
                <span>
                  {activeTab === 'invoice'
                    ? 'Сформировать счёт на оплату'
                    : activeTab === 'quote'
                    ? 'Сформировать коммерческое предложение'
                    : 'Отправить заявку менеджеру'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
