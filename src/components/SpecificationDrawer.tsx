import React from 'react';
import type { InventoryItem } from '../types';
import { WAREHOUSES, COMPANY_SELLER_DETAILS } from '../data/mockData';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2, 
  Plus, 
  Minus, 
  ShoppingBag,
  Thermometer,
  Layers,
  FileText,
  Send,
  CheckCircle2,
  Receipt,
  FlaskConical,
  Maximize2
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SpecificationDrawerProps {
  product: InventoryItem | null;
  onClose: () => void;
}

export const SpecificationDrawer: React.FC<SpecificationDrawerProps> = ({ product, onClose }) => {
  const { addToCart, openOrderDrawer, addToast, catalogTab } = useStore();
  const [copiedCas, setCopiedCas] = React.useState(false);
  const [requestedDocs, setRequestedDocs] = React.useState<Array<'sds' | 'coa'>>([]);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [qty, setQty] = React.useState(1);

  const isDishware = Boolean(
    catalogTab === 'dishware' ||
    (product?.category_name && /посуд|dishware|glass|стекл/i.test(product.category_name)) ||
    (product?.brand && /synthware|glass/i.test(product.brand)) ||
    (product?.molecular_formula && /borosilicate|стекло|glass|laboratory/i.test(product.molecular_formula))
  );

  // Reset quantity, lightbox and document requests only when product changes
  React.useEffect(() => {
    if (!product) return;
    setQty(1);
    setIsLightboxOpen(false);
    setRequestedDocs([]);
  }, [product?.id]);

  // Handle ESC key (closes lightbox first, then modal)
  React.useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, isLightboxOpen, onClose]);

  // Lock body scroll while modal is mounted
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
    setCopiedCas(true);
    setTimeout(() => setCopiedCas(false), 2000);
  };

  // SDS / CoA are provided by a manager on request (batch-specific documents),
  // so the client sends a prefilled request to the customer support mailbox.
  const handleRequestDoc = (type: 'sds' | 'coa') => {
    const docName = type === 'sds' ? 'Паспорт безопасности (SDS)' : 'Сертификат анализа (CoA)';
    const sku = product.product_code || `ID-${product.id}`;
    const hasCas = product.cas_number && product.cas_number !== 'N/A';

    const subject = `Запрос: ${docName} — ${sku}`;
    const body =
      `Здравствуйте!\n\n` +
      `Прошу предоставить документ: ${docName}.\n\n` +
      `Наименование: ${product.title_ru || product.title_en}\n` +
      (product.title_en && product.title_en !== product.title_ru ? `Международное наименование: ${product.title_en}\n` : '') +
      `Артикул: ${sku}\n` +
      (hasCas ? `${product.cas_number.startsWith('Кат.') ? product.cas_number : `CAS: ${product.cas_number}`}\n` : '') +
      `Бренд: ${product.brand || '—'}\n` +
      `Фасовка: ${product.quantity || '—'}\n\n` +
      `Организация / БИН: \n` +
      `Контактное лицо и телефон: \n`;

    const link = document.createElement('a');
    link.href = `mailto:${COMPANY_SELLER_DETAILS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setRequestedDocs(prev => (prev.includes(type) ? prev : [...prev, type]));
    addToast({
      type: 'success',
      title: 'Письмо с запросом сформировано',
      message: `${docName} • ${sku}. Отправьте письмо из почтового клиента — менеджер пришлёт документ.`,
      duration: 4000,
    });
  };

  const totalPhysical = product.stock.reduce((sum, s) => sum + s.physical, 0);
  const totalReserved = product.stock.reduce((sum, s) => sum + s.reserved, 0);
  const totalAvailable = Math.max(0, totalPhysical - totalReserved);
  const { vatMode } = useStore();
  const vatRate = vatMode === 'vat16' ? 0.16 : 0;
  const lineTotal = product.computedPrice * qty;
  const lineVat = Math.round(lineTotal * vatRate);
  const lineTotalWithVat = lineTotal + lineVat;

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
    <div className="fixed inset-0 !m-0 z-50 overflow-y-auto no-print flex items-center justify-center p-3 sm:p-6 md:p-8">
      {/* Dimmed Claude backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200" 
      />

      {/* Centered Modal Dossier Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Dossier Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-navy-900 bg-navy-50 px-2.5 py-0.5 rounded-md border border-navy-100">
                {product.product_code || `SKU-${product.id}`}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {product.brand || 'Chemexpress'}
              </span>
              {totalAvailable > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>В наличии на складе (Алматы)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Под заказ (5–10 рабочих дней)</span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {product.title_ru}
              </h2>
              {product.title_en && (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {product.title_en}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Dossier Body (2-Column Grid) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Visual Identity & Certification (5 of 12) */}
            <div className="md:col-span-5 space-y-4">
              
              {/* Product Photo Showcase (when image exists with Lightbox trigger) */}
              {product.main_image_url && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-white border border-slate-200/90 p-3 flex items-center justify-center group shadow-2xs cursor-zoom-in hover:border-navy-300 transition-all"
                  title="Нажмите, чтобы увеличить фото"
                >
                  <img 
                    src={product.main_image_url} 
                    alt={product.title_ru}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-600 uppercase bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {product.brand || 'Chemexpress'}
                    </span>
                  </div>

                  {/* Hover Zoom Prompt Badge */}
                  <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[10px] font-medium px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm">
                    <Maximize2 className="w-3 h-3" />
                    <span>Увеличить</span>
                  </div>
                </div>
              )}

              {/* Chemical Showcase Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/90 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-navy-900" />
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      {isDishware ? 'Спецификация изделия' : 'Паспорт вещества'}
                    </span>
                  </div>
                  {!product.main_image_url && (
                    <span className="text-[10px] font-mono text-slate-500 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                      {product.brand || 'TCI'}
                    </span>
                  )}
                </div>

                {/* CAS Register / Catalog Number */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                      {isDishware || product.cas_number?.startsWith('Кат.') ? 'Каталожный номер' : 'CAS Реестр'}
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {product.cas_number || '—'}
                    </div>
                  </div>
                  {product.cas_number && (
                    <button
                      onClick={handleCopyCas}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-navy-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedCas ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold text-[10px]">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Копия</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Formula / Material & Purity / Parameters */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                      {isDishware ? 'Материал' : 'Формула'}
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5 truncate">
                      {product.molecular_formula || '—'}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                      {isDishware ? 'Параметры' : 'Квалификация'}
                    </div>
                    <div className="font-semibold text-navy-900 text-xs mt-0.5 truncate">
                      {product.purity || 'ЧДА'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality & Safety Dossier (CoA / SDS) - Hidden for Dishware */}
              {!isDishware && (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-navy-900" />
                    <span>Сопроводительные документы</span>
                  </div>

                  <div className="space-y-2">
                    {([
                      {
                        type: 'sds' as const,
                        title: 'Паспорт безопасности (SDS)',
                        icon: <FileText className="w-4 h-4 text-slate-600 group-hover:text-navy-900 transition-colors" />,
                        iconBg: 'bg-slate-100 group-hover:bg-navy-50',
                      },
                      {
                        type: 'coa' as const,
                        title: 'Сертификат анализа (CoA)',
                        icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
                        iconBg: 'bg-emerald-50',
                      },
                    ]).map(doc => {
                      const isRequested = requestedDocs.includes(doc.type);
                      return (
                        <button
                          key={doc.type}
                          type="button"
                          onClick={() => handleRequestDoc(doc.type)}
                          className="w-full p-3 bg-white border border-slate-200 hover:border-navy-300 rounded-xl text-left transition-all hover:shadow-xs group cursor-pointer flex items-center justify-between gap-3"
                          title={`Отправить запрос на ${COMPANY_SELLER_DETAILS.email}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${doc.iconBg}`}>
                              {doc.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-xs group-hover:text-navy-900 transition-colors">
                                {doc.title}
                              </div>
                              <div className={`text-[10px] ${isRequested ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                {isRequested ? 'Письмо открыто в почтовом клиенте' : 'Предоставляется по запросу'}
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                            isRequested
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-navy-900 group-hover:text-white group-hover:border-navy-900'
                          }`}>
                            {isRequested ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                            <span>{isRequested ? 'Повторить' : 'Запросить'}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Документы выдаются на конкретную партию. Менеджер пришлёт их на вашу почту.
                  </p>
                </div>
              )}

            </div>

            {/* Right Column: Technical Parameters & 1C Warehouse Matrix (7 of 12) */}
            <div className="md:col-span-7 space-y-5">
              
              {/* Technical Specifications Matrix */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-navy-900" />
                    <span>Спецификация партии</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Стандарт завода</span>
                </div>

                <div className="border border-slate-200/90 rounded-2xl bg-white divide-y divide-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors">
                    <span className="text-slate-500">Степень чистоты:</span>
                    <span className="font-semibold text-slate-900 text-right">{product.purity || 'ЧДА / Чистый для анализа'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors">
                    <span className="text-slate-500">Молекулярная масса (Mw):</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {product.molecular_weight ? `${product.molecular_weight} г/моль` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors">
                    <span className="text-slate-500">Плотность / Удельный вес:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{product.density || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors">
                    <span className="text-slate-500">Фасовка производителя:</span>
                    <span className="font-semibold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                      {product.quantity || '1 шт'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors">
                    <span className="text-slate-500">Температурный режим:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                      <span>{product.storage || 'Комнатная температура (+15...+25°C)'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 1C Warehouse Stock Matrix */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-navy-900" />
                    <span>Складские терминалы (Казахстан)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 tabular-nums">
                    Свободный остаток: {totalAvailable} шт
                  </span>
                </div>

                <div className="space-y-2">
                  {product.stock.map(stockItem => {
                    const wh = WAREHOUSES.find(w => w.id === stockItem.warehouseId);
                    const free = Math.max(0, stockItem.physical - stockItem.reserved);
                    const ratio = stockItem.physical > 0 ? (free / stockItem.physical) * 100 : 0;

                    return (
                      <div 
                        key={stockItem.warehouseId}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">
                              {wh?.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {wh?.address}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-bold text-sm text-slate-900 tabular-nums">
                              {free > 0 ? (
                                <span className="text-emerald-700">{free} шт. свободно</span>
                              ) : (
                                <span className="text-slate-400">0 шт.</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                              Физический: {stockItem.physical} • В резерве: {stockItem.reserved}
                            </div>
                          </div>
                        </div>

                        {stockItem.physical > 0 && (
                          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(5, ratio)}%` }}
                              title={`Свободно: ${free} из ${stockItem.physical}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 3. Sticky Action Bottom Bar (Clean Horizontal Layout) */}
        <div className="p-5 sm:px-6 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          
          {/* Price Summary */}
          <div className="flex items-baseline gap-4">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                {vatMode === 'vat16' ? 'Цена с НДС 16%:' : 'Базовая цена (без НДС):'}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-navy-900 tabular-nums tracking-tight">
                {lineTotalWithVat.toLocaleString('ru-RU')} ₸
              </div>
              <div className="text-[11px] text-slate-500 tabular-nums">
                {vatMode === 'vat16' 
                  ? `без НДС: ${lineTotal.toLocaleString('ru-RU')} ₸ (НДС 16%: ${lineVat.toLocaleString('ru-RU')} ₸)`
                  : `${product.computedPrice.toLocaleString('ru-RU')} ₸ / ед • Без НДС (ИП на ОУР)`}
              </div>
            </div>
          </div>

          {/* Stepper + CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Stepper */}
            <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Уменьшить"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-slate-900 text-xs select-none tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Увеличить"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Specification */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>В спецификацию</span>
            </button>

            {/* Quick Invoice Button */}
            <button
              type="button"
              onClick={handleInstantInvoice}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/90 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-navy-900" />
              <span className="hidden sm:inline">Выписать счёт на оплату</span>
              <span className="sm:hidden">Счёт на оплату</span>
            </button>
          </div>

        </div>

      </div>

      {/* 4. Full-Screen Photo Lightbox Modal */}
      {isLightboxOpen && product.main_image_url && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(false);
          }}
        >
          {/* Top Bar */}
          <div 
            className="absolute top-0 inset-x-0 p-4 sm:px-8 flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-white max-w-xl truncate">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                {product.product_code || `SKU-${product.id}`}
              </span>
              <span className="font-medium text-sm text-slate-200 truncate">
                {product.title_ru}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="p-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Закрыть просмотр"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image */}
          <div 
            className="relative max-w-5xl max-h-[82vh] w-auto h-auto flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={product.main_image_url} 
              alt={product.title_ru}
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>

         
        </div>
      )}
    </div>
  );
};

