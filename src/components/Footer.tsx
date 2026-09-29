import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Truck, 
  FileCheck2, 
  Database,
  Heart,
  FileText,
  Receipt,
  Layers,
  ArrowUpRight
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs no-print mt-auto">
      {/* Value Proposition Strip */}
      <div className="border-b border-slate-200/70 bg-slate-50/60 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-navy-50 border border-navy-200/60 text-navy-900 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Складской запас в Алматы</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Оперативная отгрузка с терминала в Отеген Батыр по всем регионам РК.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-navy-50 border border-navy-200/60 text-navy-900 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Прямые поставки брендов</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Официальный импорт TCI (Япония), Macklin, ELK Bio, Servicebio.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-navy-50 border border-navy-200/60 text-navy-900 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Паспорта SDS и CoA</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Полный комплект сертификатов анализа и паспортов безопасности на партии.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-navy-50 border border-navy-200/60 text-navy-900 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Интеграция с 1С Казахстан</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Авторезерв остатков, счета с круглой печатью и экспорт CommerceML 2.09.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Corporate Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: About & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="ChemExpress" className="h-8 w-auto object-contain" />
              <div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Chemexpress</span>
                <span className="block text-[10px] font-mono text-navy-900 font-bold uppercase">B2B Модуль</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Официальный B2B портал снабжения лабораторий и предприятий Республики Казахстан. Каталог 800 000+ реактивов, мерной посуды и тест-систем.
            </p>

            <div className="pt-2 text-[11px] font-mono text-slate-600 space-y-1">
              <div>БИН: <strong className="text-slate-800">{COMPANY_SELLER_DETAILS.bin}</strong></div>
              <div>КБЕ: <strong className="text-slate-800">{COMPANY_SELLER_DETAILS.kbe}</strong></div>
            </div>
          </div>

          {/* Col 2: Clickable Categories */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Каталог и номенклатура
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('reagents', '', 'TCI')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-navy-900 transition-colors" />
                  <span>Реактивы TCI (Япония)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('reagents', '', 'Macklin')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-navy-900 transition-colors" />
                  <span>Растворители Macklin HPLC</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('dishware')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-navy-900 transition-colors" />
                  <span>Лабораторная посуда (1 280+)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('other', 'ELISA')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-navy-900 transition-colors" />
                  <span>ИФА тест-системы ELISA Kit</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('reagents', 'соляная')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-navy-900 transition-colors" />
                  <span>Прекурсоры (лицензия МВД РК)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clickable Document Features */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              B2B Документооборот
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => openOrderDrawer('invoice')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <Receipt className="w-3.5 h-3.5 text-navy-800" />
                  <span className="font-semibold text-slate-800 group-hover:text-navy-900">Выписать Счёт 1С на оплату</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openOrderDrawer('quote')}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <FileText className="w-3.5 h-3.5 text-navy-800" />
                  <span>Официальное коммерческое предложение</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1.5 cursor-pointer group"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy-900" />
                  <span>АРМ Склад 1С и журнал резервов</span>
                </button>
              </li>
              <li>
                <a
                  href="https://chemexpress.kz/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Каталог на chemexpress.kz</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://chemexpress.kz/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy-900 transition-colors text-left inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>О компании и лицензии</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Warehouse */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Склад и отдел продаж
            </h5>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-navy-900 shrink-0 mt-0.5" />
                <span>{COMPANY_SELLER_DETAILS.legalAddress}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-navy-900 shrink-0" />
                <a href="tel:+77072828030" className="hover:text-navy-900 font-semibold text-slate-900 transition-colors">
                  {COMPANY_SELLER_DETAILS.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-navy-900 shrink-0" />
                <a href="mailto:info@chemexpress.kz" className="hover:text-navy-900 transition-colors">
                  {COMPANY_SELLER_DETAILS.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Пн–Пт: 09:00 – 18:00 (Астана)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-slate-200 py-4 px-4 sm:px-6 bg-slate-50/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          
          <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
            <Building2 className="w-3.5 h-3.5 text-navy-900 shrink-0" />
            <span>© 2026 {COMPANY_SELLER_DETAILS.name}. Все права защищены. Разработано для ChemExpress B2B.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center text-slate-600 font-medium">
              <span>Created with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1 shrink-0" />
              <span>at <strong className="text-slate-900 font-bold tracking-wide">ZIZ INC.</strong></span>
            </div>

            
          </div>

        </div>
      </div>
    </footer>
  );
};
