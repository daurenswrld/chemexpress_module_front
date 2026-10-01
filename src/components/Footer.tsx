import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart, 
  FileText,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { COMPANY_SELLER_DETAILS } from '../data/mockData';
import { useStore } from '../store/useStore';

export const Footer: React.FC = () => {
  const { setCatalogTab, setSearchQuery, setCurrentView, openOrderDrawer, setSelectedBrand } = useStore();

  const handleNav = (tab: 'reagents' | 'dishware' | 'other', search = '', brand = 'all') => {
    setCurrentView('catalog');
    setCatalogTab(tab);
    if (search !== undefined) setSearchQuery(search);
    if (brand !== 'all') setSelectedBrand(brand);
    
    // Smooth scroll down to the table (with sticky navbar offset)
    setTimeout(() => {
      const tableEl = document.getElementById('catalog-table');
      if (tableEl) {
        const navOffset = 90; // sticky header height + breathing room
        const elementPosition = tableEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({ top: 480, behavior: 'smooth' });
      }
    }, 60);
  };

  return (
    <footer className="bg-[#08142c] border-t border-navy-800/90 text-slate-400 no-print mt-auto">
      {/* 1. Claude-style Hero Brand & Status Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-navy-800/70">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-xl inline-flex items-center shadow-xs">
                <img 
                  src="/logo.svg" 
                  alt="ChemExpress" 
                  className="h-7 w-auto object-contain cursor-pointer"
                  onClick={() => {
                    setCurrentView('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
              <span className="inline-block text-[11px] uppercase tracking-wider text-blue-200 font-semibold bg-navy-900/90 px-2.5 py-1.5 rounded-lg border border-navy-700/80">
                B2B Модуль Снабжения
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Цифровая платформа обеспечения химическими реактивами, стандартными образцами и специализированной посудой аккредитованных лабораторий и производств Казахстана.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Live Catalog Status Capsule */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/90 border border-navy-700/80 text-slate-200 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>Каталог реактивов и стандартов активен</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 px-3 py-1.5 rounded-full bg-navy-900/60 border border-navy-800">
                <span>БИН</span>
                <strong className="text-slate-200 font-semibold font-mono tracking-wide">{COMPANY_SELLER_DETAILS.bin}</strong>
                <span className="text-navy-600">•</span>
                <span className="text-blue-300 font-medium">{COMPANY_SELLER_DETAILS.name}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openOrderDrawer('quote')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Сформировать спецификацию</span>
            </button>

            <a
              href="https://chemexpress.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold border border-navy-700/80 transition-all cursor-pointer"
            >
              <span>Основной сайт</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* 2. Claude-style 4-Column Editorial Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 py-12">
          {/* Column 1: Номенклатура */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Номенклатура
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('reagents', '', 'TCI')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer flex items-center group"
                >
                  <span>Реактивы TCI (Япония)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('reagents', '', 'Macklin')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer flex items-center group"
                >
                  <span>Растворители Macklin</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('dishware')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer flex items-center group"
                >
                  <span>Посуда Synthware</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('other', 'ELISA')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer flex items-center group"
                >
                  <span>ИФА тест-системы</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Документооборот B2B */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Документы B2B
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <button
                  type="button"
                  onClick={() => openOrderDrawer('invoice')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Счёт на оплату
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openOrderDrawer('quote')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Официальное коммерческое предложение
                </button>
              </li>
              <li>
                <span className="text-slate-400">
                  CoA и SDS — при наличии у производителя
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  ЭСФ и сопроводительные документы — в предусмотренных законодательством случаях
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Склад и логистика */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Склад и отгрузка
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-400">
              <li>Складской комплекс Отеген Батыр</li>
              <li>Экспресс-доставка во все регионы РК</li>
              <li>Температурный контроль (+2...+8°C)</li>
              <li>Самовывоз со склада (Алматы)</li>
              <li>Отгрузка день в день при наличии</li>
            </ul>
          </div>

          {/* Column 4: Контакты и реквизиты */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Контакты
            </h4>
            <div className="space-y-2.5 text-[13px] text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-300">{COMPANY_SELLER_DETAILS.legalAddress}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+77072828030" className="hover:text-white font-medium text-slate-200 transition-colors">
                  {COMPANY_SELLER_DETAILS.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:info@chemexpress.kz" className="hover:text-white text-slate-300 transition-colors">
                  {COMPANY_SELLER_DETAILS.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0"  />
                <span  className="hover:text-white text-slate-300 transition-colors">Пн–Пт: 09:00 – 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Precursor Disclaimer Banner */}
        <div className="py-4 px-5 rounded-2xl bg-navy-950/90 border border-amber-500/20 text-[12px] sm:text-[13px] text-slate-300 leading-relaxed mb-8 flex items-start gap-3.5 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-300 font-semibold">Важное уведомление: </strong>
            ChemExpress не осуществляет реализацию прекурсоров, ядов и товаров двойного назначения, подлежащих специальному государственному контролю и/или лицензированию в Республике Казахстан. Оборот прекурсоров без лицензии — карается уголовным кодексом РК.
          </p>
        </div>

        {/* 3. Minimal Bottom Bar */}
        <div className="pt-8 border-t border-navy-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© 2026 {COMPANY_SELLER_DETAILS.name}. B2B Реестр поставок.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center text-slate-400 text-[11px]">
              <span>Created with</span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 mx-1 shrink-0" />
              <span>at <strong className="text-slate-200 font-semibold"><a target='blank' href="https://ziz.kz/">ZIZ INC.</a></strong></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

