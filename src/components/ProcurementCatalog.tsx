import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { WAREHOUSES } from '../data/mockData';
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
  ChevronRight
} from 'lucide-react';

export const ProcurementCatalog: React.FC = () => {
  const {
    products,
    totalProducts,
    currentPage,
    pageSize,
    searchQuery,
    isLoading,
    selectedBrand,
    selectedWarehouse,
    onlyInStock,
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    setSelectedBrand,
    setSelectedWarehouse,
    setOnlyInStock,
    fetchLiveProducts,
    addToCart,
    getAvailableStock,
  } = useStore();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [copiedCas, setCopiedCas] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'main' | 'dishware' | 'other'>('main');

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
    }, 450);
    return () => clearTimeout(timer);
  }, [inputVal, searchQuery, setSearchQuery]);

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
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
    if (selectedWarehouse !== 'all') {
      const s = p.stock.find(entry => entry.warehouseId === selectedWarehouse);
      if (!s || (s.physical - s.reserved) <= 0) return false;
    }
    if (onlyInStock) {
      if (getAvailableStock(p) <= 0) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Category Tabs matching official store */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'main'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Главный (Химические реактивы 800 000+)
        </button>

        <button
          onClick={() => setActiveTab('dishware')}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'dishware'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Лабораторная посуда
        </button>

        <button
          onClick={() => setActiveTab('other')}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'other'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Оборудование и Прочее
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Поиск по CAS номеру, каталожному коду или названию (live API)..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-cyan-600 focus:bg-white font-medium"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-cyan-600 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              setInputVal('');
              setSearchQuery('');
              setSelectedBrand('all');
              setSelectedWarehouse('all');
              setOnlyInStock(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Brand filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Бренд:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs outline-none"
              >
                <option value="all">Все бренды</option>
                <option value="TCI">TCI (Япония)</option>
                <option value="Macklin">Macklin (Китай)</option>
                <option value="BSY">ELK / BSY (Китай)</option>
              </select>
            </div>

            {/* Warehouse filter */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500">Склад:</span>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs outline-none"
              >
                <option value="all">Все склады РК</option>
                {WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* In stock toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-0"
              />
              <span>В наличии на складе 1С</span>
            </label>
          </div>

          <div className="text-gray-500 font-mono text-[11px]">
            База товаров: <strong className="text-gray-900 font-bold">{totalProducts.toLocaleString('ru-RU')}</strong> позиций
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <th className="p-3 w-32 font-mono">Код товара</th>
                <th className="p-3 min-w-[240px]">Наименование реактива</th>
                <th className="p-3 w-28 font-mono">CAS номер</th>
                <th className="p-3 w-24">Бренд</th>
                <th className="p-3 w-20">Фасовка</th>
                <th className="p-3 w-36">Наличие 1С</th>
                <th className="p-3 w-28 text-right font-mono">Цена без НДС</th>
                <th className="p-3 w-32 text-center">Кол-во</th>
                <th className="p-3 w-28 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    {isLoading ? 'Загрузка данных из каталога ChemExpress...' : 'Товары не найдены по текущему запросу.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const available = getAvailableStock(product);
                  const totalPhysical = product.stock.reduce((sum, s) => sum + s.physical, 0);
                  const totalReserved = product.stock.reduce((sum, s) => sum + s.reserved, 0);
                  const currentQty = getQty(product.id);
                  const priceWithVat = Math.round(product.computedPrice * 1.12);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product Code */}
                      <td className="p-3 font-mono font-semibold text-gray-900">
                        {product.product_code || `ID-${product.id}`}
                      </td>

                      {/* Names & Formula */}
                      <td className="p-3">
                        <div className="font-bold text-gray-900 leading-snug">
                          {product.title_ru}
                        </div>
                        {product.title_en && (
                          <div className="text-[11px] text-gray-500 italic mt-0.5">
                            {product.title_en}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-mono">
                          {product.molecular_formula && (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                              {product.molecular_formula}
                            </span>
                          )}
                          {product.purity && (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                              {product.purity}
                            </span>
                          )}
                          {product.storage && (
                            <span className="truncate max-w-[180px]">
                              {product.storage}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CAS Number */}
                      <td className="p-3">
                        {product.cas_number ? (
                          <button
                            onClick={(e) => handleCopyCas(product.cas_number, e)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded transition-colors"
                            title="Скопировать CAS"
                          >
                            <span>{product.cas_number}</span>
                            {copiedCas === product.cas_number ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700">
                          {product.brand || 'Chemexpress'}
                        </span>
                      </td>

                      {/* Packaging */}
                      <td className="p-3 font-mono text-[11px] text-gray-600">
                        {product.quantity || '1 шт'}
                      </td>

                      {/* 1C Stock */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${available > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`font-mono font-bold ${available > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {available > 0 ? `${available} шт.` : 'Под заказ'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Факт {totalPhysical} • Резерв {totalReserved}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-3 text-right">
                        <div className="font-mono font-bold text-gray-900 text-xs">
                          {product.computedPrice.toLocaleString('ru-RU')} ₸
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          с НДС {priceWithVat.toLocaleString('ru-RU')} ₸
                        </div>
                      </td>

                      {/* Stepper */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, currentQty - 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 py-1 font-mono font-bold text-gray-800 text-xs">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, currentQty + 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => addToCart(product, currentQty)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          В заявку
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Real Pagination matching chemexpress.kz */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Показывать по:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>товаров</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Предыдущая</span>
            </button>

            <span className="font-mono text-gray-700 px-2 font-semibold">
              {currentPage} из {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <span>Следующая</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
