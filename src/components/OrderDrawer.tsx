import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { MOCK_CLIENTS } from '../data/mockData';
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
  ArrowRight
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

  // Client form
  const [bin, setBin] = useState(MOCK_CLIENTS[0].bin);
  const [companyName, setCompanyName] = useState(MOCK_CLIENTS[0].companyName);
  const [iik, setIik] = useState(MOCK_CLIENTS[0].iik);
  const [bik, setBik] = useState(MOCK_CLIENTS[0].bik);
  const [bankName, setBankName] = useState(MOCK_CLIENTS[0].bankName);
  const [contactName, setContactName] = useState(MOCK_CLIENTS[0].contactName);
  const [contactPhone, setContactPhone] = useState(MOCK_CLIENTS[0].contactPhone);
  const [contactEmail, setContactEmail] = useState(MOCK_CLIENTS[0].contactEmail);
  const [deliveryAddress, setDeliveryAddress] = useState(MOCK_CLIENTS[0].deliveryAddress);
  const [clientComment, setClientComment] = useState('');
  const [validDays, setValidDays] = useState(14);
  const [autofilledNotice, setAutofilledNotice] = useState(false);

  if (!isOrderDrawerOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.computedPrice * item.quantity, 0);
  const vat = Math.round(subtotal * 0.12);
  const total = subtotal + vat;

  const handleSelectClient = (client: ClientEntity) => {
    setBin(client.bin);
    setCompanyName(client.companyName);
    setIik(client.iik);
    setBik(client.bik);
    setBankName(client.bankName);
    setContactName(client.contactName);
    setContactPhone(client.contactPhone);
    setContactEmail(client.contactEmail);
    setDeliveryAddress(client.deliveryAddress);
    setAutofilledNotice(true);
    setTimeout(() => setAutofilledNotice(false), 3000);
  };

  const handleBinChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 12);
    setBin(clean);
    const found = MOCK_CLIENTS.find(c => c.bin === clean);
    if (found) {
      setCompanyName(found.companyName);
      setIik(found.iik);
      setBik(found.bik);
      setBankName(found.bankName);
      setContactName(found.contactName);
      setContactPhone(found.contactPhone);
      setContactEmail(found.contactEmail);
      setDeliveryAddress(found.deliveryAddress);
      setAutofilledNotice(true);
      setTimeout(() => setAutofilledNotice(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const client: ClientEntity = {
      bin: bin || '080140012345',
      companyName: companyName || 'ТОО "Покупатель"',
      iik: iik || 'KZ456010002003456789',
      bik: bik || 'HSBKKZKX',
      bankName: bankName || 'АО "Народный Банк Казахстана"',
      contactName: contactName || 'Уполномоченное лицо',
      contactPhone: contactPhone || '+7 (701) 450-89-22',
      contactEmail: contactEmail || 'orders@company.kz',
      deliveryAddress: deliveryAddress || 'г. Алматы',
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
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      <div 
        onClick={closeOrderDrawer}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-gray-200">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Оформление B2B заявки
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {cart.length} поз. в спецификации • Сумма с НДС: <span className="font-mono font-bold text-gray-900">{total.toLocaleString('ru-RU')} ₸</span>
              </p>
            </div>
            <button
              onClick={closeOrderDrawer}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Scenario Tabs */}
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-100 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('invoice')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'invoice'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-cyan-600" />
              <span>1. Счёт (1С)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quote')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quote'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-600" />
              <span>2. Запрос КП</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'request'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
              <span>3. Менеджеру</span>
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            
            {/* Quick Preset Selector */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Быстрый выбор контрагента:
                </span>
                {autofilledNotice && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Реквизиты заполнены
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MOCK_CLIENTS.map(c => (
                  <button
                    type="button"
                    key={c.bin}
                    onClick={() => handleSelectClient(c)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                      bin === c.bin
                        ? 'bg-cyan-600 text-white border-cyan-600 font-semibold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {c.companyName}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal and Contact Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">БИН организации (12 цифр)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={bin}
                    maxLength={12}
                    onChange={(e) => handleBinChange(e.target.value)}
                    placeholder="080140012345"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-xs outline-none focus:border-cyan-600"
                    required
                  />
                  <Building2 className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Наименование компании</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder='ТОО "КазХимСинтез"'
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-cyan-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Контактное лицо</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Бережной Алексей"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-cyan-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Телефон</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+7 (701) 450-89-22"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-xs outline-none focus:border-cyan-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Email для документов</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="procurement@company.kz"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-cyan-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Адрес доставки</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="г. Алматы, мкр. Алатау"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-cyan-600"
                />
              </div>
            </div>

            {/* Validity selector for Quote */}
            {activeTab === 'quote' && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <span className="text-gray-700 font-semibold">Срок действия КП:</span>
                <div className="flex gap-1.5">
                  {[7, 14, 30].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValidDays(d)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        validDays === d ? 'bg-cyan-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
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
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Спецификация товаров ({cart.length})</span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:underline font-normal"
                  >
                    Очистить всё
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl text-xs">
                  Спецификация пуста. Добавьте реактивы из таблицы кнопкой «В заявку».
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div 
                      key={item.product.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-gray-600">
                            {item.product.product_code || `ID-${item.product.id}`}
                          </span>
                          {item.product.cas_number && (
                            <span className="font-mono text-[10px] text-gray-400">
                              CAS {item.product.cas_number}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 truncate mt-0.5">
                          {item.product.title_ru}
                        </h4>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {item.product.computedPrice.toLocaleString('ru-RU')} ₸ / {item.product.quantity || 'шт'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-gray-400 hover:text-rose-600"
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
              <label className="block text-gray-700 font-bold mb-1 text-xs">
                Примечание / Требования к партии
              </label>
              <textarea
                rows={2}
                value={clientComment}
                onChange={(e) => setClientComment(e.target.value)}
                placeholder="Укажите особые требования (паспорт CoA, температурный режим, срочность)..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-cyan-600"
              />
            </div>

            {/* Footer Summary & Submit */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 mt-auto">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Сумма без НДС:</span>
                  <span className="font-mono font-semibold">{subtotal.toLocaleString('ru-RU')} ₸</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>НДС 12% (РК):</span>
                  <span className="font-mono font-semibold">{vat.toLocaleString('ru-RU')} ₸</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-sm font-bold">
                  <span className="text-gray-900">Всего к оплате:</span>
                  <span className="font-mono text-cyan-700 text-base font-extrabold">
                    {total.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>Товар автоматически бронируется на складе в 1С на 7 дней.</span>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>
                  {activeTab === 'invoice'
                    ? 'Сформировать счёт (1С) и зарезервировать'
                    : activeTab === 'quote'
                    ? 'Сформировать официальное КП'
                    : 'Отправить заявку менеджеру'}
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
