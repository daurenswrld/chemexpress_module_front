import React from 'react';
import type { InventoryItem } from '../types';
import { WAREHOUSES } from '../data/mockData';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  Download, 
  Building2, 
  Plus, 
  Minus, 
  ShoppingBag,
  Thermometer,
  Layers
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SpecificationDrawerProps {
  product: InventoryItem | null;
  onClose: () => void;
}

export const SpecificationDrawer: React.FC<SpecificationDrawerProps> = ({ product, onClose }) => {
  const { addToCart, openOrderDrawer } = useStore();
  const [copied, setCopied] = React.useState(false);
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    if (!product) return;
    const prevOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [product]);

  if (!product) return null;

  const handleCopyCas = () => {
    if (!product.cas_number) return;
    navigator.clipboard.writeText(product.cas_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPhysical = product.stock.reduce((sum, s) => sum + s.physical, 0);
  const totalReserved = product.stock.reduce((sum, s) => sum + s.reserved, 0);
  const totalAvailable = Math.max(0, totalPhysical - totalReserved);
  const priceWithVat = Math.round(product.computedPrice * 1.12);

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  const handleInstantInvoice = () => {
    addToCart(product, qty);
    onClose();
    openOrderDrawer('invoice');
  };

  return (
    <div className="fixed inset-0 !m-0 z-50 overflow-hidden no-print">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="drawer-header">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-200/60">
                  {product.product_code || `SKU-${product.id}`}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {product.brand || 'Chemexpress'}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                {product.title_ru}
              </h2>
              {product.title_en && (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {product.title_en}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
            
            {/* Quick Summary Pill Bar */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* CAS */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CAS Регистрационный номер
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {product.cas_number || '—'}
                  </span>
                  {product.cas_number && (
                    <button
                      onClick={handleCopyCas}
                      className="p-1 text-slate-400 hover:text-navy-900 transition-colors"
                      title="Скопировать CAS"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Chemical Formula */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Химическая формула
                </div>
                <div className="mt-1 font-mono font-bold text-slate-900 text-sm truncate">
                  {product.molecular_formula || '—'}
                </div>
              </div>
            </div>

            {/* Technical Parameters Table */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-navy-900" />
                Техническая спецификация реактива
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                <div className="flex justify-between p-2.5">
                  <span className="text-slate-500">Степень чистоты / Квалификация:</span>
                  <span className="font-semibold text-slate-900 font-mono">{product.purity || 'ЧДА / Чистый для анализа'}</span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-slate-500">Молекулярный вес (Mw):</span>
                  <span className="font-semibold text-slate-900 font-mono">{product.molecular_weight ? `${product.molecular_weight} г/моль` : '—'}</span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-slate-500">Плотность / Удельный вес:</span>
                  <span className="font-semibold text-slate-900 font-mono">{product.density || '—'}</span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-slate-500">Фасовка производителя:</span>
                  <span className="font-bold text-navy-900 font-mono">{product.quantity || '1 шт'}</span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-slate-500">Температурный режим хранения:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{product.storage || 'Комнатная температура (+15...+25°C)'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Warehouse Stock Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-navy-900" />
                  Наличие на складах 1С (Казахстан)
                </h4>
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Доступно к заказу: {totalAvailable} шт
                </span>
              </div>

              <div className="space-y-2">
                {product.stock.map(stockItem => {
                  const wh = WAREHOUSES.find(w => w.id === stockItem.warehouseId);
                  const free = Math.max(0, stockItem.physical - stockItem.reserved);

                  return (
                    <div 
                      key={stockItem.warehouseId}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 leading-snug">
                          {wh?.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {wh?.address}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-slate-900">
                          {free > 0 ? (
                            <span className="text-emerald-700 font-extrabold">{free} шт.</span>
                          ) : (
                            <span className="text-slate-400">0 шт.</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Факт: {stockItem.physical} • Резерв: {stockItem.reserved}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality and Compliance Docs */}
            <div className="p-3.5 bg-navy-50/60 border border-navy-100 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-navy-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-navy-800" />
                <span>Сертификаты и контроль качества партии</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Каждая отгружаемая позиция сопровождается официальным паспортом безопасности химического вещества (SDS) и сертификатом заводского анализа производителя (CoA).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                  <FileText className="w-3 h-3 text-cyan-600" />
                  Паспорт SDS (ГОСТ РК)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                  <Download className="w-3 h-3 text-cyan-600" />
                  Сертификат CoA
                </span>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3 mt-auto">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500">Стоимость позиции:</span>
              <div className="text-right">
                <span className="font-mono text-base font-extrabold text-navy-900">
                  {(product.computedPrice * qty).toLocaleString('ru-RU')} ₸
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  с НДС 12%: {(priceWithVat * qty).toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-mono font-bold text-slate-900 text-sm">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Specification */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>В спецификацию заявки</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleInstantInvoice}
              className="w-full py-2 px-3 rounded-lg border border-navy-900 text-navy-900 hover:bg-navy-50 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Мгновенно выписать Счёт на оплату (1С)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
