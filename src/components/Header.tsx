import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ExternalLink,
  Clock,
  Mail,
  ArrowLeft,
  FlaskConical,
  TestTube2,
  Boxes,
  FileText,
  ShieldCheck,
  ShieldAlert,
  User
} from 'lucide-react';
import { COMPANY_SELLER_DETAILS } from '../data/mockData';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    catalogTab, 
    setCatalogTab, 
    cart, 
    openOrderDrawer,
    vatMode,
    currentUser,
    currentOrganization,
    openAuthModal,
    openOrgProfileModal
  } = useStore();

  const handleCategoryClick = (tab: 'reagents' | 'dishware' | 'other') => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
    setCatalogTab(tab);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.product.computedPrice * item.quantity, 0);
  const displayTotal = vatMode === 'vat16' ? totalAmount + Math.round(totalAmount * 0.16) : totalAmount;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-all">
      {/* Top Utility Bar */}
      <div className="bg-slate-100/80 border-b border-slate-200/60 text-slate-600 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Location & Hours */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-navy-800" />
              <span>Алматы, с. Отеген Батыр, ул. Мусрепова, 5а</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Пн–Пт: 09:00 – 18:00</span>
            </span>
          </div>

          {/* Right: Direct Contacts & Main Portal */}
          <div className="flex items-center gap-4 text-[11px]">
            <a 
              href="tel:+77072828030" 
              className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-navy-900 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-navy-800" />
              <span>{COMPANY_SELLER_DETAILS.phone}</span>
            </a>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <a
              href="mailto:order@chemexpress.kz"
              className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline-flex"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>order@chemexpress.kz</span>
            </a>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <a
              href="https://chemexpress.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-navy-700 transition-colors"
              title="Перейти на сайт chemexpress.kz"
            >
              <span>chemexpress.kz</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {currentView === 'catalog' && (
              <>
                <span className="text-slate-300">|</span>

                {/* Top Bar Account / Login for Client */}
                {currentUser && currentOrganization ? (
                  <button
                    type="button"
                    onClick={openOrgProfileModal}
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-navy-900 transition-colors cursor-pointer"
                    title="Личный кабинет организации"
                  >
                    <div className="w-4 h-4 rounded bg-navy-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <span className="truncate max-w-[120px]">{currentUser.fullName.split(' ')[0]}</span>
                    <span className="text-slate-400 font-normal truncate max-w-[120px] hidden md:inline">({currentOrganization.companyName})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-navy-900 transition-colors cursor-pointer group"
                    title="Войти в личный кабинет"
                  >
                    <User className="w-3.5 h-3.5 text-navy-800 group-hover:scale-105 transition-transform" />
                    <span>Войти</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 lg:gap-6">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setCurrentView('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center cursor-pointer group select-none shrink-0"
        >
          <img 
            src="/logo.svg" 
            alt="ChemExpress" 
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </div>

        {/* Center: Live Catalog Navigation Pills */}
        <nav className="mr-auto  hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => handleCategoryClick('reagents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'catalog' && catalogTab === 'reagents'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-navy-700" />
            <span>Реактивы</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryClick('dishware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'catalog' && catalogTab === 'dishware'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5 text-navy-700" />
            <span>Посуда Synthware</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryClick('other')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'catalog' && catalogTab === 'other'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-navy-700" />
            <span>Биореактивы & ELISA</span>
          </button>
        </nav>


        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Admin or Manager Mode Badge & Return (Only visible when admin or manager view is active) */}
          {currentView === 'admin' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-900 bg-purple-50 px-2.5 py-1.5 rounded-xl border border-purple-200 hidden sm:inline-flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                <span>Панель Администратора</span>
              </span>
              <button
                onClick={() => setCurrentView('catalog')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>В каталог</span>
              </button>
            </div>
          ) : currentView === 'manager' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-900 bg-cyan-50 px-2.5 py-1.5 rounded-xl border border-cyan-200 hidden sm:inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                <span>АРМ Менеджера ChemExpress</span>
              </span>
              <button
                onClick={() => setCurrentView('catalog')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>В каталог</span>
              </button>
            </div>
          ) : (
            <>
              {/* Quick Quote Trigger */}
              <button
                type="button"
                onClick={() => openOrderDrawer('quote')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Сформировать коммерческое предложение"
              >
                <FileText className="w-3.5 h-3.5 text-navy-800" />
                <span>Запросить КП</span>
              </button>

              {/* B2B Cart / Requisition Button */}
              <button
                type="button"
                onClick={() => openOrderDrawer('invoice')}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all shadow-xs cursor-pointer select-none active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4 text-white/90 shrink-0" />
                <span>Спецификация</span>

                {totalCount > 0 && (
                  <>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-white font-mono text-[11px] font-bold leading-none">
                      {totalCount}
                    </span>
                    <span className="hidden sm:inline-block font-mono text-xs text-white/80 border-l border-white/20 pl-2 ml-0.5">
                      {displayTotal.toLocaleString('ru-RU')} ₸
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
