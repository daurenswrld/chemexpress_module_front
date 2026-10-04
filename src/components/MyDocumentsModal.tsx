import React from 'react';
import { useStore } from '../store/useStore';
import { 
  X, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Eye, 
  FolderOpen
} from 'lucide-react';

export const MyDocumentsModal: React.FC = () => {
  const { 
    isMyDocumentsOpen, 
    closeMyDocuments, 
    orders, 
    setPreviewOrder,
    openOrderDrawer,
    currentUser,
    currentOrganization,
    openAuthModal
  } = useStore();

  // Lock body scroll and handle Escape key
  React.useEffect(() => {
    if (!isMyDocumentsOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMyDocuments();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMyDocumentsOpen, closeMyDocuments]);

  if (!isMyDocumentsOpen) return null;

  const displayedOrders = currentUser && currentOrganization
    ? orders.filter(o => o.organizationBin === currentOrganization.bin || o.client.bin === currentOrganization.bin)
    : orders;

  return (
    <div className="fixed inset-0 !m-0 z-50 overflow-hidden no-print flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        onClick={closeMyDocuments}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] z-10 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-navy-50 text-navy-900 border border-navy-100">
              <FolderOpen className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {currentUser && currentOrganization ? `Документы: ${currentOrganization.companyName}` : 'Мои документы и заказы'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser && currentOrganization 
                  ? `БИН: ${currentOrganization.bin} • Общий доступ для сотрудников организации`
                  : 'Сформированные коммерческие предложения и счета на оплату'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMyDocuments}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Закрыть (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Orders List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {/* Org or Guest status alert */}
          {currentUser && currentOrganization ? (
            <div className="p-3 rounded-xl bg-navy-50/70 border border-navy-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-navy-800" />
                <span className="font-bold text-navy-950">{currentOrganization.companyName}</span>
                <span className="font-mono text-slate-500 text-[11px]">БИН: {currentOrganization.bin}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Синхронизировано
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <span className="text-amber-900 text-xs">
                Войдите в аккаунт организации по БИН, чтобы документы сохранялись на всех компьютерах вашей компании.
              </span>
              <button
                type="button"
                onClick={() => {
                  closeMyDocuments();
                  openAuthModal('login');
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer shrink-0 text-xs"
              >
                Войти
              </button>
            </div>
          )}

          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">У вас пока нет сформированных документов</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Выберите необходимые химические реактивы или лабораторную посуду в каталоге и выпишите предварительный Счёт или КП.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeMyDocuments();
                    openOrderDrawer('quote');
                  }}
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Сформировать спецификацию
                </button>
              </div>
            </div>
          ) : (
            displayedOrders.map(order => {
              const isQuote = order.type === 'quote';
              const createdDate = new Date(order.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div 
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isQuote ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {isQuote ? <FileText className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 font-mono">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            • {isQuote ? 'Коммерческое предложение' : 'Счёт на оплату'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          от {createdDate}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {order.isManagerConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Подтверждено менеджером</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Предварительный (на проверке)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-600 flex items-center gap-1.5 truncate max-w-sm">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{order.client.companyName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">(БИН {order.client.bin})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">
                          {order.totalKzt.toLocaleString('ru-RU')} ₸
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {order.vatMode === 'vat16' ? 'с НДС 16%' : 'без НДС'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          closeMyDocuments();
                          setPreviewOrder(order);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-navy-900 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        title="Открыть официальный бланк для печати или сохранения в PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Открыть</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Сохранено в вашем браузере</span>
          <button
            type="button"
            onClick={closeMyDocuments}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
