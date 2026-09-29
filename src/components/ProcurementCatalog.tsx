import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { WAREHOUSES } from '../data/mockData';
import type { InventoryItem } from '../types';
import { SpecificationDrawer } from './SpecificationDrawer';
import { 
  Search, 
  RotateCcw, 
  Copy, 
  Check, 
  Plus, 
  Minus, 
  Building2, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Layers,
  Thermometer,
  Receipt,
  FileText,
  Filter,
  ArrowRight,
  FlaskConical,
  TestTube2,
  Boxes
} from 'lucide-react';

export const ProcurementCatalog: React.FC = () => {
  const {
    catalogTab,
    products,
    totalProducts,
    currentPage,
    pageSize,
    searchQuery,
    isLoading,
    selectedBrand,
    selectedWarehouse,
    onlyInStock,
    setCatalogTab,
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    setSelectedBrand,
    setSelectedWarehouse,
    setOnlyInStock,
    fetchLiveProducts,
    addToCart,
    getAvailableStock,
    cart,
    openOrderDrawer,
  } = useStore();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [copiedCas, setCopiedCas] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial live products on mount
  useEffect(() => {
    fetchLiveProducts();
  }, [fetchLiveProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputVal !== searchQuery) {
        setSearchQuery(inputVal);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputVal, searchQuery, setSearchQuery]);

  // Keep local input in sync when search query is changed from header
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyCas = (cas: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cas);
    setCopiedCas(cas);
    setTimeout(() => setCopiedCas(null), 1800);
  };

  const getQty = (id: number) => quantities[id] || 1;
  const setQty = (id: number, val: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const filteredProducts = products.filter(p => {
    if (selectedWarehouse !== 'all') {
      const s = p.stock.find(entry => entry.warehouseId === selectedWarehouse);
      if (!s || (s.physical - s.reserved) <= 0) return false;
    }
    if (onlyInStock) {
      if (getAvailableStock(p) <= 0) return false;
    }
    return true;
  });

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.product.computedPrice * item.quantity, 0);
  const cartTotalWithVat = cartTotalAmount + Math.round(cartTotalAmount * 0.12);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="space-y-5 pb-16">
      
      {/* 1. Institutional Hero & KPI Metrics Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div>
            <div className="text-[11px] font-bold text-navy-800 uppercase tracking-wider mb-1">
              Дистрибьютор химической продукции в Республике Казахстан
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Каталог химических реактивов и лабораторной продукции
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Прямые поставки реактивов высокой степени чистоты (ЧДА, ХЧ, ОСЧ), аналитических стандартов, лабораторной посуды и расходных материалов со склада в Алматы.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Номенклатура
              </div>
              <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                {totalProducts.toLocaleString('ru-RU')}
              </div>
              <div className="text-[10px] text-slate-500">наименований в базе</div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Складской комплекс
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                Отеген Батыр
              </div>
              <div className="text-[10px] text-slate-500">Алматы и регионы РК</div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-left col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Документы
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                НДС 12%
              </div>
              <div className="text-[10px] text-slate-500">Паспорта CoA / SDS</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Command Search & Multifaceted Filtering */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-subtle space-y-4">
        
        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => {
              setCatalogTab('reagents');
              setInputVal('');
            }}
            className={catalogTab === 'reagents' ? 'tab-pill-active' : 'tab-pill-inactive'}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Химические реактивы</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              catalogTab === 'reagents' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              800 000+
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCatalogTab('dishware');
              setInputVal('');
            }}
            className={catalogTab === 'dishware' ? 'tab-pill-active' : 'tab-pill-inactive'}
          >
            <TestTube2 className="w-3.5 h-3.5" />
            <span>Лабораторная посуда</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              catalogTab === 'dishware' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              1 280+
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCatalogTab('other');
              setInputVal('');
            }}
            className={catalogTab === 'other' ? 'tab-pill-active' : 'tab-pill-inactive'}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Биология и Прочее</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              catalogTab === 'other' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              26 000+
            </span>
          </button>
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              catalogTab === 'reagents'
                ? 'Введите CAS-номер (например: 78-27-3), каталожный код (TCI-E0297) или наименование...'
                : catalogTab === 'dishware'
                ? 'Поиск посуды: колбы (flask), холодильники (condenser), трубки, шлифы 24/40, кат. №...'
                : 'Поиск биореагентов: ИФА наборы (ELISA Kit), антитела, биохимия...'
            }
            className="w-full pl-11 pr-24 py-3 text-xs bg-slate-50/80 border border-slate-300 rounded-xl outline-none focus:border-navy-900 focus:bg-white focus:ring-2 focus:ring-navy-900/10 font-medium transition-all"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-navy-900 animate-spin" />
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                /
              </kbd>
            )}

            {inputVal && (
              <button
                onClick={() => setInputVal('')}
                className="text-xs text-slate-400 hover:text-slate-700 px-1 py-0.5 cursor-pointer"
              >
                Очистить
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Быстрый поиск:
          </span>
          {(catalogTab === 'reagents'
            ? [
                { label: 'CAS 78-27-3', q: '78-27-3' },
                { label: 'Ацетонитрил HPLC', q: 'Ацетонитрил' },
                { label: 'Соляная кислота', q: 'соляная' },
                { label: 'TCI Реактивы', q: 'TCI' },
                { label: 'Macklin', q: 'Macklin' },
                { label: 'BSY / ELK', q: 'BSY' },
              ]
            : catalogTab === 'dishware'
            ? [
                { label: 'Колбы (Flask)', q: 'flask' },
                { label: 'Холодильники (Condenser)', q: 'condenser' },
                { label: 'Пробирки (Tube)', q: 'tube' },
                { label: 'Шлифы 24/40', q: '24/40' },
                { label: 'PTFE краны', q: 'PTFE' },
                { label: 'Synthware', q: 'V222440' },
              ]
            : [
                { label: 'ELISA Kit (ИФА)', q: 'ELISA' },
                { label: 'Антитела (Antibody)', q: 'Antibody' },
                { label: 'Assay Kit', q: 'Assay' },
                { label: 'ELK Biotechnology', q: 'ELK' },
                { label: 'Servicebio', q: 'Servicebio' },
              ]
          ).map(chip => (
            <button
              key={chip.label}
              type="button"
              onClick={() => setInputVal(chip.q)}
              className="quick-chip"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Бренд:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-navy-900 cursor-pointer"
              >
                <option value="all">Все производители</option>
                {catalogTab === 'reagents' && (
                  <>
                    <option value="TCI">TCI (Япония)</option>
                    <option value="Macklin">Macklin (Китай)</option>
                    <option value="BSY">BSY (США/КНР)</option>
                  </>
                )}
                {catalogTab === 'dishware' && (
                  <>
                    <option value="SYNTHWARE GLASS INC.">SYNTHWARE GLASS INC.</option>
                    <option value="BKMAMLAB">BKMAMLAB</option>
                    <option value="AsOne">AsOne</option>
                  </>
                )}
                {catalogTab === 'other' && (
                  <>
                    <option value="ELK">ELK Biotechnology</option>
                    <option value="Servicebio">Servicebio</option>
                    <option value="BSY">BSY</option>
                  </>
                )}
              </select>
            </div>

            {/* Warehouse Filter */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Склад:</span>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-navy-900 cursor-pointer"
              >
                <option value="all">Все склады РК</option>
                {WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* In-stock Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-slate-300 text-navy-900 focus:ring-0 cursor-pointer"
              />
              <span>Только в наличии на складе 1С</span>
            </label>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setInputVal('');
              setSearchQuery('');
              setSelectedBrand('all');
              setSelectedWarehouse('all');
              setOnlyInStock(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить фильтры</span>
          </button>

        </div>

      </div>

      {/* 3. Professional Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
        
        {/* Table Header Context Strip */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-navy-900" />
            <span>
              {catalogTab === 'reagents'
                ? 'Номенклатурный перечень химических реактивов'
                : catalogTab === 'dishware'
                ? 'Каталог лабораторной посуды и стекла'
                : 'Биологические препараты, ИФА и тест-системы'}
            </span>
            <span className="font-mono text-slate-400">({totalProducts.toLocaleString('ru-RU')} в реестре)</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            Нажмите на строку товара для просмотра технической спецификации
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="catalog-table">
            <thead>
              <tr>
                <th className="catalog-th w-44 ">Артикул / CAS</th>
                <th className="catalog-th min-w-[340px]">
                  {catalogTab === 'reagents'
                    ? 'Наименование и формула'
                    : catalogTab === 'dishware'
                    ? 'Изделие и параметры'
                    : 'Наименование продукта'}
                </th>
                <th className="catalog-th w-32">Бренд / Фасовка</th>
                <th className="catalog-th w-44">Склад 1С</th>
                <th className="catalog-th w-36 text-right ">Цена с НДС</th>
                <th className="catalog-th w-56 text-right">Заказ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-navy-900 animate-spin" />
                        <span className="text-xs font-semibold text-slate-600">Запрос в реестр ChemExpress...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">Товары не найдены</p>
                        <p className="text-[11px] text-slate-400">Попробуйте изменить запрос или сбросить фильтры.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const available = getAvailableStock(product);
                  const totalPhysical = product.stock.reduce((sum, s) => sum + s.physical, 0);
                  const currentQty = getQty(product.id);
                  const priceWithVat = Math.round(product.computedPrice * 1.12);

                  return (
                    <tr 
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="catalog-tr group"
                    >
                      {/* 1. Артикул & CAS */}
                      <td className="catalog-td">
                        <div className="font-mono font-bold text-xs text-slate-900 group-hover:text-navy-900 transition-colors truncate">
                          {product.product_code || `ID-${product.id}`}
                        </div>
                        {product.cas_number && product.cas_number !== 'N/A' && (
                          <div className="mt-1" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleCopyCas(product.cas_number, e)}
                              className="badge-cas"
                              title="Скопировать CAS / Кат. номер"
                            >
                              <span>{product.cas_number}</span>
                              {copiedCas === product.cas_number ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 2. Наименование и Спецификация */}
                      <td className="catalog-td">
                        <div className="flex items-center gap-3">
                          {/* Photo Thumbnail only for Dishware and Other (strictly removed from Reagents) */}
                          {catalogTab !== 'reagents' && product.main_image_url && (
                            <div className="w-10 h-10 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                              <img 
                                src={product.main_image_url} 
                                alt={product.title_ru} 
                                className="w-full h-full object-contain p-0.5" 
                                loading="lazy"
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 text-xs leading-snug group-hover:text-navy-900 transition-colors line-clamp-1" title={product.title_ru}>
                              {product.title_ru}
                            </div>
                            {product.title_en && product.title_en !== product.title_ru && (
                              <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5" title={product.title_en}>
                                {product.title_en}
                              </div>
                            )}

                            {/* Clean single-line badges (Never wrap down into rows!) */}
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 overflow-hidden whitespace-nowrap">
                              {product.molecular_formula && product.molecular_formula !== '-' && (
                                <span className="badge-formula">
                                  {product.molecular_formula}
                                </span>
                              )}
                              {product.purity && (
                                <span className="badge-purity">
                                  {product.purity}
                                </span>
                              )}
                              {product.storage && (
                                <span className="badge-storage">
                                  <Thermometer className="w-3 h-3 text-cyan-600" />
                                  <span className="truncate max-w-[110px]">{product.storage}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Бренд & Фасовка */}
                      <td className="catalog-td">
                        <span className="badge-brand">
                          {product.brand || 'ChemExpress'}
                        </span>
                        <div className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
                          {product.quantity || '1 шт'}
                        </div>
                      </td>

                      {/* 4. Склад 1С */}
                      <td className="catalog-td">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${available > 0 ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
                          <span className={`font-semibold text-xs ${available > 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                            {available > 0 ? `В наличии: ${available} шт.` : 'Под заказ (5-10 дн)'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          Отеген Батыр (Факт: {totalPhysical})
                        </div>
                      </td>

                      {/* 5. Цена с НДС */}
                      <td className="catalog-td text-right">
                        <div className="font-mono font-extrabold text-slate-900 text-xs">
                          {priceWithVat.toLocaleString('ru-RU')} ₸
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          без НДС {product.computedPrice.toLocaleString('ru-RU')} ₸
                        </div>
                      </td>

                      {/* 6. Заказ: Степпер + Кнопка */}
                      <td className="catalog-td text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <div className="stepper-container">
                            <button
                              type="button"
                              onClick={() => setQty(product.id, currentQty - 1)}
                              className="stepper-btn"
                              title="Уменьшить"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="stepper-value">
                              {currentQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(product.id, currentQty + 1)}
                              className="stepper-btn"
                              title="Увеличить"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(product, currentQty)}
                            className="btn-cart-primary"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                            <span>В заявку</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Показывать по:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>товаров на странице</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Предыдущая</span>
            </button>

            <span className="font-mono text-slate-700 px-2 font-bold">
              {currentPage} из {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer"
            >
              <span>Следующая</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>

      {/* 4. Product Technical Specification Drawer Modal */}
      {selectedProduct && (
        <SpecificationDrawer 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* 5. Floating Bottom Requisition Dock (when items added) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 no-print animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-elevated border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-600 text-white flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Спецификация заявки</span>
                  <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-mono font-bold border border-cyan-500/30">
                    {cartCount} поз.
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Сумма с НДС 12%: <strong className="text-white font-extrabold">{cartTotalWithVat.toLocaleString('ru-RU')} ₸</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openOrderDrawer('quote')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>КП с печатью</span>
              </button>

              <button
                type="button"
                onClick={() => openOrderDrawer('invoice')}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-navy-600 hover:bg-navy-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Выписать Счёт 1С</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
