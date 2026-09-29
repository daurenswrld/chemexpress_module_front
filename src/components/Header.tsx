import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ExternalLink,
  Clock,
  Mail,
  ArrowLeft,
  Search,
  X,
  FlaskConical,
  TestTube2,
  Boxes,
  FileText
} from 'lucide-react';
import { COMPANY_SELLER_DETAILS } from '../data/mockData';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    catalogTab, 
    setCatalogTab, 
    searchQuery, 
    setSearchQuery, 
    cart, 
    openOrderDrawer 
  } = useStore();

  const [headerSearch, setHeaderSearch] = useState(searchQuery);

  // Sync with global store search query
  useEffect(() => {
    setHeaderSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (val: string) => {
    setHeaderSearch(val);
    setSearchQuery(val);
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
  };

  const handleCategoryClick = (tab: 'reagents' | 'dishware' | 'other') => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
    setCatalogTab(tab);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.product.computedPrice * item.quantity, 0);
  const totalWithVat = totalAmount + Math.round(totalAmount * 0.12);

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

            <span className="text-slate-300">|</span>

            <a
              href="https://chemexpress.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-navy-700 transition-colors"
            >
              <span>chemexpress.kz</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
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
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0">
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

        {/* Center-Right: Compact Live Search in Header */}
        <div className="flex-1 max-w-xs md:max-w-sm xl:max-w-md relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск по CAS, названию или кат. №..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 transition-all font-medium placeholder:text-slate-400"
          />
          {headerSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Admin Mode Badge & Return (Only visible when admin view is active) */}
          {currentView === 'admin' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Служебный журнал 1С
              </span>
              <button
                onClick={() => setCurrentView('catalog')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
                title="Сформировать официальное коммерческое предложение с круглой печатью"
              >
                <FileText className="w-3.5 h-3.5 text-navy-800" />
                <span>Запросить КП</span>
              </button>

              {/* B2B Cart / Requisition Button */}
              <button
                onClick={() => openOrderDrawer('invoice')}
                className={`inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer select-none active:scale-[0.98] ${
                  totalCount > 0
                    ? 'bg-navy-900 hover:bg-navy-800 text-white shadow-navy-900/10'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-cyan-300" />
                  {totalCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] leading-tight shadow-xs">
                      {totalCount}
                    </span>
                  )}
                </div>

                <div className="text-left hidden sm:block">
                  <div className="leading-tight font-bold">
                    {totalCount > 0 ? 'Спецификация' : 'Оформить заявку'}
                  </div>
                  {totalCount > 0 && (
                    <div className="text-[10px] font-mono font-medium text-cyan-200 leading-tight">
                      {totalWithVat.toLocaleString('ru-RU')} ₸
                    </div>
                  )}
                </div>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
