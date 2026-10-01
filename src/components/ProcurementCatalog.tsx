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
  Boxes,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
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
    openOrderDrawer,
    vatMode,
    setVatMode,
  } = useStore();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [copiedCas, setCopiedCas] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isClientFiltering, setIsClientFiltering] = useState(false);
  const [sortField, setSortField] = useState<'default' | 'price' | 'stock' | 'title'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const isSearching = inputVal !== searchQuery;
  const isTableBusy = isLoading || isClientFiltering || isSearching;

  const handleSort = (field: 'price' | 'stock' | 'title') => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('default');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const scrollToTableTop = () => {
    if (tableRef.current) {
      const navOffset = 90; // account for sticky header height
      const elementPosition = tableRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

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

  const displayProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === 'price') {
      return sortDirection === 'asc' 
        ? a.computedPrice - b.computedPrice 
        : b.computedPrice - a.computedPrice;
    }
    if (sortField === 'stock') {
      const stockA = getAvailableStock(a);
      const stockB = getAvailableStock(b);
      return sortDirection === 'asc' ? stockA - stockB : stockB - stockA;
    }
    if (sortField === 'title') {
      return sortDirection === 'asc'
        ? a.title_ru.localeCompare(b.title_ru)
        : b.title_ru.localeCompare(a.title_ru);
    }
    return 0;
  });

  const hasActiveFilters = Boolean(
    searchQuery || 
    selectedBrand !== 'all' || 
    selectedWarehouse !== 'all' || 
    onlyInStock ||
    sortField !== 'default'
  );

  return (
    <>
      <div className="space-y-5 pb-16">
      
      {/* 1. ChemExpress Editorial Navy Hero */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-[#0e3b8a] text-white border border-navy-800/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle technical grid pattern */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Copywriting on Navy */}
          <div className="lg:col-span-7 space-y-5">
            {/* Metadata Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">ИП «ChemExpress»</span>
              <span className="text-white/30">•</span>
              <span className="font-mono text-[11px] text-cyan-300">Официальный B2B реестр</span>
            </div>

            {/* Headline with quiet confidence */}
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-white tracking-[-0.03em] leading-[1.15] font-display">
              Химические реактивы высокой чистоты и лабораторные системы
            </h1>

            {/* Editorial Description */}
            <p className="text-slate-300 text-xs sm:text-[14px] leading-relaxed max-w-xl font-normal">
              Официальные прямые поставки аналитических стандартов, чистых реактивов (TCI, Macklin, BSY) и лабораторного стекла Synthware со склада в Алматы. Поставки по контрактам с юридическими лицами Республики Казахстан с полным пакетом закрывающих документов.
            </p>

            {/* Minimalist Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openOrderDrawer('quote')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-navy-950 font-bold text-xs sm:text-sm transition-all cursor-pointer select-none active:scale-[0.98] shadow-sm"
              >
                <FileText className="w-4 h-4 text-navy-950" />
                <span>Запросить КП</span>
                <ArrowRight className="w-3.5 h-3.5 text-navy-800" />
              </button>

              <button
                type="button"
                onClick={() => openOrderDrawer('invoice')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm border border-white/15 backdrop-blur-sm transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                <Receipt className="w-4 h-4 text-cyan-300" />
                <span>Счёт на оплату</span>
              </button>
            </div>

            {/* Editorial Key Stats Bar */}
            <div className="pt-4 border-t border-white/15 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-mono font-bold text-white text-sm sm:text-base">
                  {totalProducts.toLocaleString('ru-RU')}
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">в реестре номенклатуры</div>
              </div>

              <div>
                <div className="font-mono font-bold text-cyan-300 text-sm sm:text-base">ЭСФ / Документы</div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">Полный пакет закрывающих документов</div>
              </div>

              <div>
                <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base">CoA / SDS</div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">паспорта заводов</div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Architectural Showcase on Navy */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-sm shadow-xl p-1.5">
              <img 
                src="/images/hero-lab.jpg" 
                alt="ChemExpress Laboratory Standards" 
                className="w-full h-64 sm:h-72 lg:h-80 object-cover rounded-xl"
              />
              <div className="mt-2.5 px-3 py-2 flex items-center justify-between text-xs border-t border-white/10 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-[11px] font-medium">Контроль качества партий</span>
                </div>
                <span className="font-mono text-[10px] font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  Сертификаты CoA / SDS
                </span>
              </div>
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
                { label: 'Изопропанол HPLC', q: 'изопропанол' },
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
              onClick={() => {
                setInputVal(chip.q);
                setSearchQuery(chip.q);
              }}
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
              <span className="text-slate-500 font-medium">Склад:</span>
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  const val = e.target.value;
                  setIsClientFiltering(true);
                  setSelectedWarehouse(val);
                  setTimeout(() => setIsClientFiltering(false), 180);
                }}
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
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsClientFiltering(true);
                  setOnlyInStock(val);
                  setTimeout(() => setIsClientFiltering(false), 180);
                }}
                className="rounded border-slate-300 text-navy-900 focus:ring-0 cursor-pointer"
              />
              <span>Только в наличии на складе</span>
            </label>

            {/* Option 1: Tax / VAT Mode Switcher in Catalog Toolbar */}
            <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-200">
              <span className="text-slate-500 font-medium">НДС:</span>
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setVatMode('none')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    vatMode === 'none'
                      ? 'bg-white text-navy-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Режим без НДС (ИП на ОУР)"
                >
                  Без НДС
                </button>
                <button
                  type="button"
                  onClick={() => setVatMode('vat16')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    vatMode === 'vat16'
                      ? 'bg-navy-900 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Режим с НДС 16% (ставка РК 2026)"
                >
                  С НДС (16%)
                </button>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setIsClientFiltering(true);
              setInputVal('');
              setSearchQuery('');
              setSelectedBrand('all');
              setSelectedWarehouse('all');
              setOnlyInStock(false);
              setSortField('default');
              setSortDirection('asc');
              setTimeout(() => setIsClientFiltering(false), 200);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить всё</span>
          </button>

        </div>

        {/* Active Filters Pills Strip */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs animate-in fade-in duration-150">
            <span className="text-[11px] font-semibold text-slate-400">Применено:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-50 text-navy-900 border border-navy-200/80 font-medium text-[11px]">
                <span>Поиск: «{searchQuery}»</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    setSearchQuery('');
                  }}
                  className="p-0.5 hover:text-rose-600 rounded cursor-pointer"
                  title="Удалить поисковый фильтр"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrand !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-50 text-navy-900 border border-navy-200/80 font-medium text-[11px]">
                <span>Бренд: {selectedBrand}</span>
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className="p-0.5 hover:text-rose-600 rounded cursor-pointer"
                  title="Снять фильтр бренда"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedWarehouse !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-50 text-navy-900 border border-navy-200/80 font-medium text-[11px]">
                <span>Склад: {WAREHOUSES.find(w => w.id === selectedWarehouse)?.name || selectedWarehouse}</span>
                <button
                  type="button"
                  onClick={() => setSelectedWarehouse('all')}
                  className="p-0.5 hover:text-rose-600 rounded cursor-pointer"
                  title="Снять фильтр склада"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium text-[11px]">
                <span>В наличии на складе</span>
                <button
                  type="button"
                  onClick={() => setOnlyInStock(false)}
                  className="p-0.5 hover:text-rose-600 rounded cursor-pointer"
                  title="Показывать все товары"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sortField !== 'default' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium text-[11px]">
                <span>Сортировка: {sortField === 'price' ? 'По цене' : sortField === 'stock' ? 'По остаткам' : 'По названию'} ({sortDirection === 'asc' ? 'возр.' : 'убыв.'})</span>
                <button
                  type="button"
                  onClick={() => {
                    setSortField('default');
                    setSortDirection('asc');
                  }}
                  className="p-0.5 hover:text-rose-600 rounded cursor-pointer"
                  title="Сбросить сортировку"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

      </div>

      {/* 3. Professional Data Table */}
      <div 
        ref={tableRef} 
        id="catalog-table"
        className={`relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card transition-all duration-200 ${
          isTableBusy ? 'max-h-[480px]' : ''
        }`}
      >
        
        {/* Loading Overlay when table is busy (filter applying, search debouncing, API fetching) */}
        {isTableBusy && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-30 flex flex-col items-center pt-20 sm:pt-28 cursor-wait select-none transition-all animate-in fade-in duration-150">
            <div className="sticky top-44 z-40 bg-white border border-slate-200 shadow-elevated rounded-2xl px-6 py-4 flex items-center gap-3.5 max-w-sm mx-auto">
              <div className="p-2.5 rounded-xl bg-navy-50 text-navy-900 border border-navy-100/80">
                <Loader2 className="w-5 h-5 text-navy-900 animate-spin" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Обновление номенклатуры...
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Применение фильтров и актуализация каталога
                </div>
              </div>
            </div>
          </div>
        )}

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

        <div className={`overflow-x-auto transition-opacity duration-150 ${isTableBusy ? 'opacity-40 pointer-events-none' : ''}`}>
          <table className="catalog-table">
            <thead>
              <tr>
                <th className="catalog-th w-44">Артикул / CAS</th>
                <th 
                  className="catalog-th min-w-[340px] cursor-pointer hover:bg-slate-100/80 transition-colors select-none group/th"
                  onClick={() => handleSort('title')}
                  title="Сортировать по наименованию"
                >
                  <div className="flex items-center gap-1.5">
                    <span>
                      {catalogTab === 'reagents'
                        ? 'Наименование и формула'
                        : catalogTab === 'dishware'
                        ? 'Изделие и параметры'
                        : 'Наименование продукта'}
                    </span>
                    <span className="text-slate-400 group-hover/th:text-slate-700">
                      {sortField === 'title' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-navy-900" /> : <ArrowDown className="w-3.5 h-3.5 text-navy-900" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover/th:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
                <th className="catalog-th w-32">Бренд / Фасовка</th>
                <th 
                  className="catalog-th w-44 cursor-pointer hover:bg-slate-100/80 transition-colors select-none group/th"
                  onClick={() => handleSort('stock')}
                  title="Сортировать по доступным остаткам"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Наличие / Склад</span>
                    <span className="text-slate-400 group-hover/th:text-slate-700">
                      {sortField === 'stock' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-navy-900" /> : <ArrowDown className="w-3.5 h-3.5 text-navy-900" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover/th:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
                <th 
                  className="catalog-th w-36 text-right cursor-pointer hover:bg-slate-100/80 transition-colors select-none group/th"
                  onClick={() => handleSort('price')}
                  title={vatMode === 'vat16' ? 'Сортировать по цене с НДС 16%' : 'Сортировать по цене без НДС'}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{vatMode === 'vat16' ? 'Цена с НДС (16%)' : 'Цена без НДС'}</span>
                    <span className="text-slate-400 group-hover/th:text-slate-700">
                      {sortField === 'price' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-navy-900" /> : <ArrowDown className="w-3.5 h-3.5 text-navy-900" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover/th:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
                <th className="catalog-th w-56 text-right">Заказ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {displayProducts.length === 0 ? (
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
                displayProducts.map(product => {
                  const available = getAvailableStock(product);
                  const currentQty = getQty(product.id);
                  const displayPrice = vatMode === 'vat16' 
                    ? Math.round(product.computedPrice * 1.16) 
                    : product.computedPrice;

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
                          {/* Photo Thumbnail if available */}
                          {product.main_image_url && (
                            <div className="w-10 h-10 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                              <img 
                                src={product.main_image_url} 
                                alt={product.title_ru} 
                                className="w-full h-full object-contain p-0.5" 
                                loading="lazy"
                                onError={(e) => {
                                  // Hide container if image fails to load
                                  (e.currentTarget.parentElement as HTMLElement)?.classList.add('hidden');
                                }}
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

                      {/* 4. Склад и наличие */}
                      <td className="catalog-td">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${available > 0 ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
                          <span className={`font-semibold text-xs ${available > 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                            {available > 0 ? `В наличии: ${available} шт.` : 'Под заказ (5-10 дн)'}
                          </span>
                        </div>
                        {/* <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          Отеген Батыр (Факт: {totalPhysical})
                        </div> */}
                      </td>

                      {/* 5. Цена */}
                      <td className="catalog-td text-right">
                        <div className="font-bold text-slate-900 text-xs tabular-nums">
                          {displayPrice.toLocaleString('ru-RU')} ₸
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                          {vatMode === 'vat16' 
                            ? `без НДС ${product.computedPrice.toLocaleString('ru-RU')} ₸` 
                            : 'без НДС (0%)'}
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
        <div className={`p-4 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs transition-opacity duration-150 ${isTableBusy ? 'opacity-40 pointer-events-none' : ''}`}>
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
              onClick={() => {
                setCurrentPage(Math.max(1, currentPage - 1));
                scrollToTableTop();
              }}
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
              onClick={() => {
                setCurrentPage(currentPage + 1);
                scrollToTableTop();
              }}
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
    </>
  );
};
