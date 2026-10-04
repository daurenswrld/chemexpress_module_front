import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  X, 
  Building2, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Eye, 
  MapPin, 
  ShieldCheck,
  Copy,
  Check,
  CreditCard,
  ShoppingBag,
  Mail,
  Phone,
  Receipt
} from 'lucide-react';
import type { Order } from '../types';

export const ClientCabinetModal: React.FC = () => {
  const { 
    isOrgProfileModalOpen, 
    closeOrgProfileModal, 
    currentUser, 
    currentOrganization, 
    users, 
    orders, 
    logout, 
    setPreviewOrder,
    openOrderDrawer 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'documents' | 'org' | 'members'>('documents');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOrgProfileModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOrgProfileModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOrgProfileModalOpen, closeOrgProfileModal]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  if (!isOrgProfileModalOpen || !currentUser || !currentOrganization) return null;

  // Documents belonging to this organization by BIN
  const orgOrders = orders.filter(o => 
    o.organizationBin === currentOrganization.bin || 
    o.client.bin === currentOrganization.bin
  );

  // Colleague members belonging to this organization by BIN
  const orgMembers = users.filter(u => u.organizationBin === currentOrganization.bin);

  // Quick stats
  const confirmedCount = orgOrders.filter(o => o.isManagerConfirmed).length;
  const pendingCount = orgOrders.length - confirmedCount;
  const totalSpend = orgOrders.reduce((sum, o) => sum + o.totalKzt, 0);

  return (
    <div className="fixed inset-0 !m-0 z-50 overflow-hidden no-print flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-150">
      {/* Dimmed backdrop */}
      <div 
        onClick={closeOrgProfileModal}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Main Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 my-auto animate-in zoom-in-95 duration-200">
        
        {/* 1. Executive Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-navy-900 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm shadow-navy-950/20">
              {currentUser.fullName.charAt(0)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  {currentUser.fullName}
                </h3>
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 pt-0.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate max-w-[220px]">
                  <Building2 className="w-3.5 h-3.5 text-navy-800 shrink-0" />
                  <span className="truncate">{currentOrganization.companyName}</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                  БИН {currentOrganization.bin}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                logout();
                closeOrgProfileModal();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="Выйти из аккаунта"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>

            <button
              type="button"
              onClick={closeOrgProfileModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Sleek Segmented Tab Switcher */}
        <div className="px-6 pt-3.5 pb-3 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Документы и Счета</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {orgOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('org')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'org'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Реквизиты компании</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Сотрудники</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'members' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {orgMembers.length}
            </span>
          </button>
        </div>

        {/* 3. Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          
          {/* TAB 1: Documents (Invoices & Quotes) */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              
              {/* Metric stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Всего заказов</div>
                  <div className="text-lg font-bold font-mono text-slate-900">{orgOrders.length}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Подтверждено</div>
                  <div className="text-lg font-bold font-mono text-emerald-700">{confirmedCount}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">На проверке</div>
                  <div className="text-lg font-bold font-mono text-amber-700">{pendingCount}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Общая сумма</div>
                  <div className="text-base font-bold font-mono text-navy-950 truncate">
                    {totalSpend.toLocaleString('ru-RU')} ₸
                  </div>
                </div>
              </div>

              {/* Document items list */}
              {orgOrders.length === 0 ? (
                <div className="text-center py-14 px-4 space-y-3.5 border border-dashed border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">У вашей организации пока нет счетов</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Сформируйте спецификацию или выпишите предварительный счёт на оплату реактивов из каталога.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeOrgProfileModal();
                      openOrderDrawer('invoice');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                    <span>Открыть спецификацию</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orgOrders.map((order: Order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm transition-all space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 font-mono text-sm tracking-tight">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                            order.type === 'invoice'
                              ? 'bg-navy-50 text-navy-900 border-navy-200/60'
                              : 'bg-cyan-50 text-cyan-900 border-cyan-200/60'
                          }`}>
                            {order.type === 'invoice' ? 'Счёт на оплату' : 'Коммерческое предложение'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.isManagerConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Подтверждён менеджером</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>На проверке</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setPreviewOrder(order);
                              closeOrgProfileModal();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors cursor-pointer active:scale-[0.98]"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Бланк А4</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-slate-500 text-xs">
                        <div className="flex items-center gap-3">
                          <span>Позиций: <strong className="text-slate-800 font-mono">{order.items.length}</strong></span>
                          <span>•</span>
                          <span>Выписан: {new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                          {order.client.contactName && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">Автор: {order.client.contactName}</span>
                            </>
                          )}
                        </div>

                        <div className="text-slate-900 font-bold font-mono text-sm">
                          {order.totalKzt.toLocaleString('ru-RU')} ₸
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Organization Card */}
          {activeTab === 'org' && (
            <div className="space-y-5 text-xs">
              
              {/* Section 1: Official entity info */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-navy-800" />
                  <span>Юридические сведения</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* BIN */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">БИН организации</div>
                      <div className="text-sm font-mono font-bold text-slate-900 pt-0.5">{currentOrganization.bin}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentOrganization.bin, 'bin')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                      title="Скопировать БИН"
                    >
                      {copiedKey === 'bin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Company Name */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Наименование компании</div>
                      <div className="text-sm font-bold text-slate-900 truncate pt-0.5">{currentOrganization.companyName}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentOrganization.companyName, 'companyName')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                      title="Скопировать наименование"
                    >
                      {copiedKey === 'companyName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Banking Details */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-navy-800" />
                  <span>Банковские реквизиты</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* IIK / IBAN */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3 sm:col-span-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Расчётный счёт (ИИК / IBAN)</div>
                      <div className="text-sm font-mono font-bold text-slate-900 pt-0.5">
                        {currentOrganization.iik || 'Не указан'}
                      </div>
                    </div>
                    {currentOrganization.iik && (
                      <button
                        type="button"
                        onClick={() => handleCopy(currentOrganization.iik, 'iik')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                        title="Скопировать IBAN"
                      >
                        {copiedKey === 'iik' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-0.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Банк обслуживания</div>
                    <div className="text-xs font-bold text-slate-800">{currentOrganization.bankName || 'Не указан'}</div>
                    <div className="text-[11px] font-mono text-slate-500">БИК: {currentOrganization.bik}</div>
                  </div>

                  {/* KBE */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-0.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">КБЕ</div>
                    <div className="text-xs font-bold text-slate-800">{currentOrganization.kbe || '17'}</div>
                    <div className="text-[11px] text-slate-500">Юридическое лицо – резидент РК</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Delivery Address */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-navy-800" />
                  <span>Адрес поставки и склада</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{currentOrganization.deliveryAddress || 'Адрес доставки не указан'}</span>
                  </div>
                  {currentOrganization.deliveryAddress && (
                    <button
                      type="button"
                      onClick={() => handleCopy(currentOrganization.deliveryAddress, 'deliveryAddress')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                      title="Скопировать адрес"
                    >
                      {copiedKey === 'deliveryAddress' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Members of this Organization */}
          {activeTab === 'members' && (
            <div className="space-y-4 text-xs">
              
              {/* Explanatory banner */}
              <div className="p-3.5 rounded-2xl bg-navy-50/80 border border-navy-100 text-navy-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-navy-800 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-xs">
                  Все сотрудники организации привязаны к БИН <strong className="font-mono">{currentOrganization.bin}</strong>. Они имеют общий доступ к сформированным спецификациям, счетам на оплату и статусам отгрузок компании.
                </p>
              </div>

              {/* Members List */}
              <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden bg-white">
                {orgMembers.map(member => (
                  <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {member.fullName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="truncate">{member.fullName}</span>
                          {member.id === currentUser.id && (
                            <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 shrink-0">
                              Это вы
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{member.email}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{member.phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
