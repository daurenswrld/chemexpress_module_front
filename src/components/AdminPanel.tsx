import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  ArrowLeft, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Save, 
  Percent, 
  Sliders, 
  Database, 
  UserCheck, 
  UserX, 
  Calendar,
  LogOut
} from 'lucide-react';

interface ManagerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'senior_manager' | 'sales_manager' | 'logistics_manager';
  status: 'active' | 'inactive';
  ordersHandled: number;
  lastActive: string;
}

const INITIAL_MANAGERS: ManagerUser[] = [
  {
    id: 'usr-1',
    name: 'Айгуль Муратова',
    email: 'a.muratova@chemexpress.kz',
    phone: '+7 (707) 282-80-31',
    role: 'senior_manager',
    status: 'active',
    ordersHandled: 48,
    lastActive: '5 мин назад',
  },
  {
    id: 'usr-2',
    name: 'Данияр Касымов',
    email: 'd.kassymov@chemexpress.kz',
    phone: '+7 (707) 282-80-32',
    role: 'sales_manager',
    status: 'active',
    ordersHandled: 32,
    lastActive: '18 мин назад',
  },
  {
    id: 'usr-3',
    name: 'Елена Васильева',
    email: 'e.vassilyeva@chemexpress.kz',
    phone: '+7 (707) 282-80-33',
    role: 'sales_manager',
    status: 'active',
    ordersHandled: 29,
    lastActive: '1 час назад',
  },
  {
    id: 'usr-4',
    name: 'Нурлан Садыков',
    email: 'n.sadykov@chemexpress.kz',
    phone: '+7 (707) 282-80-34',
    role: 'logistics_manager',
    status: 'active',
    ordersHandled: 64,
    lastActive: 'В сети',
  },
];

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip: string;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'log-1',
    timestamp: 'Сегодня, 16:14',
    actor: 'Айгуль Муратова',
    action: 'Подтверждение документа',
    details: 'Счёт CX-2026-8915 переведён в статус: Подтверждено менеджером',
    ip: '178.88.192.44',
  },
  {
    id: 'log-2',
    timestamp: 'Сегодня, 15:40',
    actor: 'Нурлан Садыков',
    action: 'Оприходование партии',
    details: 'Поступление 50 шт «1-этинил-1-циклогексанол» на Центральный склад Алматы',
    ip: '178.88.192.45',
  },
  {
    id: 'log-3',
    timestamp: 'Сегодня, 14:22',
    actor: 'Система (B2B Portal)',
    action: 'Генерация счёта',
    details: 'Клиент ТОО "ЛабФарм Трейд" сформировал предварительный счёт',
    ip: '95.56.241.10',
  },
  {
    id: 'log-4',
    timestamp: 'Вчера, 18:05',
    actor: 'Администратор системы',
    action: 'Обновление параметров',
    details: 'Установлен базовый срок действия счетов: 5 рабочих дней',
    ip: '178.88.192.40',
  },
];

export const AdminPanel: React.FC = () => {
  const { setCurrentView, vatMode, setVatMode, staffUser, logoutStaff } = useStore();

  const [activeTab, setActiveTab] = useState<'managers' | 'pricing' | 'audit' | 'system'>('managers');
  const [managers, setManagers] = useState<ManagerUser[]>(INITIAL_MANAGERS);
  const [auditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);

  // System pricing & tax settings state
  const [markupPercent, setMarkupPercent] = useState<number>(15);
  const [quoteValidityDays, setQuoteValidityDays] = useState<number>(5);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(150000);
  const [autoNotifyEmail, setAutoNotifyEmail] = useState(true);
  const [autoNotifyTelegram, setAutoNotifyTelegram] = useState(true);

  const toggleManagerStatus = (id: string) => {
    setManagers(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'inactive' : 'active';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="ChemExpress" className="h-6 w-auto object-contain shrink-0" />
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              <span>Роль: Главный Администратор</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Системное управление ChemExpress</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Панель управления администратора
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Управление учетными записями менеджеров, глобальными правилами ценообразования, налоговым режимом и журналами безопасности.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {staffUser && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
              <div className="w-6 h-6 rounded-lg bg-purple-900 text-white font-bold flex items-center justify-center text-[10px]">
                {staffUser.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-purple-950 leading-tight">{staffUser.fullName}</div>
                <div className="text-[10px] text-purple-700 font-mono">Главный Администратор</div>
              </div>
              <button
                type="button"
                onClick={logoutStaff}
                className="ml-1 p-1 text-purple-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="Выйти из служебного профиля"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>В каталог витрины</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('manager')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Кабинет менеджера (/manager)</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('managers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'managers'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Сотрудники и менеджеры ({managers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Ценообразование и налоги</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Журнал безопасности и аудит</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>API & Статус интеграции</span>
        </button>
      </div>

      {/* Tab Content 1: Managers Management */}
      {activeTab === 'managers' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Учетные записи менеджеров продаж</h3>
                <p className="text-xs text-slate-500">Сотрудники, имеющие доступ к согласованию счетов и резервированию товара</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                Активных учетных записей: {managers.filter(m => m.status === 'active').length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Сотрудник</th>
                    <th className="py-3 px-4">Контакты</th>
                    <th className="py-3 px-4">Роль</th>
                    <th className="py-3 px-4">Заказов в работе</th>
                    <th className="py-3 px-4">Активность</th>
                    <th className="py-3 px-4">Статус доступа</th>
                    <th className="py-3 px-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {managers.map(manager => (
                    <tr key={manager.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{manager.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {manager.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{manager.email}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{manager.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {manager.role === 'senior_manager' ? 'Старший менеджер' : manager.role === 'sales_manager' ? 'Менеджер продаж' : 'Логист'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {manager.ordersHandled}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {manager.lastActive}
                      </td>
                      <td className="py-3.5 px-4">
                        {manager.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Активен
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-600" />
                            Заблокирован
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleManagerStatus(manager.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            manager.status === 'active'
                              ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {manager.status === 'active' ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Приостановить</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Активировать</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Pricing & Tax Rules */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Глобальные правила ценообразования и налогообложения</h3>
            <p className="text-xs text-slate-500">Управление налоговым режимом и автоматическими надбавками для B2B клиентов</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* VAT Mode */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Налоговый режим по умолчанию</h4>
                  <p className="text-[11px] text-slate-500">Базовый режим оформления документов</p>
                </div>
                <Percent className="w-4 h-4 text-purple-700" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVatMode('none')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    vatMode === 'none'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Без НДС (ИП на ОУР)
                </button>
                <button
                  type="button"
                  onClick={() => setVatMode('vat16')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    vatMode === 'vat16'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  С НДС 16%
                </button>
              </div>
            </div>

            {/* Markup % */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Базовая наценка на импорт</h4>
                  <p className="text-[11px] text-slate-500">Применяется к номенклатуре TCI, Macklin, Alfa Aesar</p>
                </div>
                <Sliders className="w-4 h-4 text-purple-700" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <span className="text-xs text-slate-600 font-medium">% торговая надбавка</span>
              </div>
            </div>

            {/* Validity Days */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Срок действия счетов и КП</h4>
                  <p className="text-[11px] text-slate-500">Автоматический срок актуальности цен и брони</p>
                </div>
                <Calendar className="w-4 h-4 text-purple-700" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={quoteValidityDays}
                  onChange={(e) => setQuoteValidityDays(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <span className="text-xs text-slate-600 font-medium">календарных дней</span>
              </div>
            </div>

            {/* Free Delivery Threshold */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Бесплатная доставка от</h4>
                  <p className="text-[11px] text-slate-500">Порог бесплатной курьерской доставки по Алматы и РК</p>
                </div>
                <Building2 className="w-4 h-4 text-purple-700" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="number"
                  step="10000"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                  className="w-36 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <span className="text-xs text-slate-600 font-medium">₸ без НДС</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить параметры системы</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab Content 3: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Журнал безопасности и аудит действий</h3>
              <p className="text-xs text-slate-500">Неизменяемый реестр ключевых транзакций и действий пользователей системы</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-[11px] border border-purple-200">
                      {log.actor}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs">{log.details}</div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono shrink-0">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </span>
                  <span>IP: {log.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: System & API Status */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Подключение к сервисам ChemExpress</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Каталог chemexpress.kz (API)</div>
                    <div className="text-[11px] text-slate-500">Синхронизация 800 000+ реактивов и посуды</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Kaspi Pay QR эквайринг</div>
                    <div className="text-[11px] text-slate-500">Генерация платёжных QR-кодов в счетах на оплату</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Активен
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Бронирование складских остатков</div>
                    <div className="text-[11px] text-slate-500">Резервирование по факту оплаты менеджером</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Включено
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Уведомления о новых счетах</h3>
            <p className="text-xs text-slate-500">Каналы доставки информации менеджерам при формировании новых документов клиентами</p>

            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50/80 transition-colors">
                <span className="text-xs font-bold text-slate-800">Email-оповещения на order@chemexpress.kz</span>
                <input
                  type="checkbox"
                  checked={autoNotifyEmail}
                  onChange={(e) => setAutoNotifyEmail(e.target.checked)}
                  className="rounded text-purple-900 focus:ring-purple-700 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50/80 transition-colors">
                <span className="text-xs font-bold text-slate-800">Telegram Webhook для дежурного менеджера</span>
                <input
                  type="checkbox"
                  checked={autoNotifyTelegram}
                  onChange={(e) => setAutoNotifyTelegram(e.target.checked)}
                  className="rounded text-purple-900 focus:ring-purple-700 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
