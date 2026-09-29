import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Building2, 
  Phone, 
  MapPin, 
  FileSpreadsheet, 
  ShoppingCart, 
  Layers
} from 'lucide-react';
import { COMPANY_SELLER_DETAILS } from '../data/mockData';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, cart, openOrderDrawer } = useStore();

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 no-print">
      {/* Top Contact Micro Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {COMPANY_SELLER_DETAILS.legalAddress}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              {COMPANY_SELLER_DETAILS.phone}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-300">
            <span className="inline-flex items-center gap-1 font-mono text-cyan-300">
              <Building2 className="w-3 h-3 text-cyan-400" />
              БИН {COMPANY_SELLER_DETAILS.bin}
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline text-emerald-400 font-medium">
              1С:Предприятие 8.3 • Синхронизация склада
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={() => setCurrentView('catalog')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-sm">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
              <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-gray-900 font-sans">
                Chemexpress
              </span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                B2B • 1C
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium -mt-0.5">
              Модуль складского учёта и генерации документов
            </p>
          </div>
        </div>

        {/* View Switcher and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setCurrentView('catalog')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'catalog'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span>Каталог товаров</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'admin'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
              <span>Рабочее место 1С</span>
            </button>
          </div>

          {/* Cart / Order Drawer Trigger */}
          <button
            onClick={() => openOrderDrawer('invoice')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Оформить заявку</span>
            {totalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-cyan-800 text-[11px] font-mono">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
