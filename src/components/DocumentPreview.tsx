import React, { useEffect } from 'react';
import type { Order } from '../types';
import { useStore } from '../store/useStore';
import { COMPANY_SELLER_DETAILS, WAREHOUSES } from '../data/mockData';
import { 
  Printer, 
  Download, 
  Mail, 
  X, 
  Building2, 
  QrCode, 
  FileSpreadsheet
} from 'lucide-react';

interface DocumentPreviewProps {
  order: Order;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ order, onClose }) => {
  const { addToast } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [onClose]);

  const isInvoice = order.type === 'invoice';
  const isQuote = order.type === 'quote';

  const docTitle = isInvoice
    ? `Счет на оплату № ${order.orderNumber}`
    : isQuote
    ? `Коммерческое предложение № ${order.orderNumber}`
    : `Заявка на поставку № ${order.orderNumber}`;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const validUntilDate = order.validUntil
    ? new Date(order.validUntil).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    addToast({
      type: 'success',
      title: 'Документ отправлен',
      message: `PDF ${docTitle} успешно выслан на почту: ${order.client.contactEmail}`,
    });
  };

  const handleExport1C = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.09" ДатаФормирования="${new Date().toISOString()}">
  <Документ>
    <Ид>${order.id}</Ид>
    <Номер>${order.orderNumber}</Номер>
    <Дата>${order.createdAt.split('T')[0]}</Дата>
    <ХозОперация>Заказ товара</ХозОперация>
    <Роль>Продавец</Роль>
    <Валюта>KZT</Валюта>
    <Курс>1</Курс>
    <Сумма>${order.totalKzt}</Сумма>
    <Контрагенты>
      <Контрагент>
        <Ид>${order.client.bin}</Ид>
        <Наименование>${order.client.companyName}</Наименование>
        <БИН>${order.client.bin}</БИН>
        <РасчетныеСчета>
          <РасчетныйСчет>
            <НомерСчета>${order.client.iik}</НомерСчета>
            <Банк>
              <БИК>${order.client.bik}</БИК>
              <Наименование>${order.client.bankName}</Наименование>
            </Банк>
          </РасчетныйСчет>
        </РасчетныеСчета>
      </Контрагент>
    </Контрагенты>
    <Товары>
      ${order.items.map(item => `
      <Товар>
        <Ид>${item.productId}</Ид>
        <Артикул>${item.sku}</Артикул>
        <Наименование>${item.name}</Наименование>
        <БазоваяЕдиница Код="796">шт</БазоваяЕдиница>
        <ЦенаЗаЕдиницу>${item.priceKzt}</ЦенаЗаЕдиницу>
        <Количество>${item.quantity}</Количество>
        <Сумма>${item.priceKzt * item.quantity}</Сумма>
        <СтавкаНДС>12</СтавкаНДС>
      </Товар>`).join('')}
    </Товары>
  </Документ>
</КоммерческаяИнформация>`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `1C_Document_${order.orderNumber}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'info',
      title: 'Выгрузка для 1С Бухгалтерии',
      message: `Файл 1C_Document_${order.orderNumber}.xml сформирован по стандарту CommerceML 2.09`,
    });
  };

  return (
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-200">
        
        {/* Action Header - Excluded from Print */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{docTitle}</h3>
              <p className="text-[11px] text-gray-400">
                Статус: <span className="text-cyan-400 font-mono font-medium">{order.status}</span> • Резерв на складе зафиксирован
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать А4</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              onClick={handleExport1C}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all"
              title="Выгрузить в формате CommerceML (1C:Предприятие 8)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>В 1С (XML)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Strict A4 Accounting Standard) */}
        <div className="p-8 sm:p-12 overflow-y-auto max-h-[80vh] text-gray-900 bg-white font-sans text-xs leading-normal select-text">
          
          {/* Sample Bank Order Box */}
          {isInvoice && (
            <div className="mb-6 border border-gray-400">
              <div className="text-[10px] text-gray-500 font-semibold p-1.5 bg-gray-50 border-b border-gray-300">
                Внимание! Оплата данного счета означает согласие с условиями поставки. Уведомление об оплате обязательно.
              </div>
              <table className="w-full text-left border-collapse text-[11px]">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300 w-1/2">
                      <span className="text-[10px] text-gray-500 block">Банк получателя:</span>
                      <strong className="font-semibold">{COMPANY_SELLER_DETAILS.bankName}</strong>
                    </td>
                    <td className="p-2 w-1/4 border-r border-gray-300">
                      <span className="text-[10px] text-gray-500 block">БИК:</span>
                      <strong className="font-mono">{COMPANY_SELLER_DETAILS.bik}</strong>
                    </td>
                    <td className="p-2 w-1/4">
                      <span className="text-[10px] text-gray-500 block">КБЕ:</span>
                      <strong className="font-mono">{COMPANY_SELLER_DETAILS.kbe}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-gray-300">
                      <span className="text-[10px] text-gray-500 block">Получатель:</span>
                      <strong className="font-semibold">{COMPANY_SELLER_DETAILS.name}</strong>
                      <div className="text-[10px] text-gray-600 font-mono mt-0.5">БИН {COMPANY_SELLER_DETAILS.bin}</div>
                    </td>
                    <td colSpan={2} className="p-2">
                      <span className="text-[10px] text-gray-500 block">Счет получателя (ИИК / IBAN):</span>
                      <strong className="font-mono font-bold text-gray-900">{COMPANY_SELLER_DETAILS.iik}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Document Header Title */}
          <div className="border-b-2 border-gray-900 pb-2 mb-6 flex items-baseline justify-between">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {docTitle} от {formattedDate} г.
            </h1>
            {validUntilDate && (
              <span className="text-xs text-gray-600 font-medium">
                Действителен до: <strong className="font-mono text-gray-900">{validUntilDate}</strong>
              </span>
            )}
          </div>

          {/* Supplier & Customer details */}
          <div className="space-y-3 mb-6 text-xs">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-2 font-bold text-gray-700">Поставщик:</span>
              <div className="col-span-10 text-gray-900 leading-snug">
                <strong>{COMPANY_SELLER_DETAILS.name}</strong>, БИН {COMPANY_SELLER_DETAILS.bin}, {COMPANY_SELLER_DETAILS.legalAddress}, тел.: {COMPANY_SELLER_DETAILS.phone}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-2 font-bold text-gray-700">Покупатель:</span>
              <div className="col-span-10 text-gray-900 leading-snug">
                <strong>{order.client.companyName}</strong>, БИН {order.client.bin}, {order.client.deliveryAddress}
                {order.client.contactPhone && `, тел.: ${order.client.contactPhone}`}
                {order.client.contactEmail && `, email: ${order.client.contactEmail}`}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-2 font-bold text-gray-700">Основание:</span>
              <div className="col-span-10 text-gray-800">
                Заявка покупателя через B2B-модуль ChemExpress ({order.orderNumber})
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-900 mb-4 text-[11px]">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-900 text-center">
                <th className="border border-gray-900 p-1.5 w-8">№</th>
                <th className="border border-gray-900 p-1.5 w-28">Код товара</th>
                <th className="border border-gray-900 p-1.5 text-left">Товары (реактивы, материалы)</th>
                <th className="border border-gray-900 p-1.5 w-16">Кол-во</th>
                <th className="border border-gray-900 p-1.5 w-12">Ед.</th>
                <th className="border border-gray-900 p-1.5 w-24 text-right">Цена, ₸</th>
                <th className="border border-gray-900 p-1.5 w-28 text-right">Сумма, ₸</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const wh = WAREHOUSES.find(w => w.id === item.warehouseId);
                const sumWithoutVat = item.priceKzt * item.quantity;
                return (
                  <tr key={item.productId} className="border-b border-gray-300">
                    <td className="border border-gray-900 p-1.5 text-center font-mono">{index + 1}</td>
                    <td className="border border-gray-900 p-1.5 text-center font-mono text-[10px] text-gray-600">
                      {item.sku}
                    </td>
                    <td className="border border-gray-900 p-1.5 text-gray-900">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        Фасовка: {item.packaging} {item.casNumber ? `| CAS: ${item.casNumber}` : ''} | Склад: {wh?.name}
                      </div>
                    </td>
                    <td className="border border-gray-900 p-1.5 text-center font-mono font-bold">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-900 p-1.5 text-center">
                      шт
                    </td>
                    <td className="border border-gray-900 p-1.5 text-right font-mono">
                      {item.priceKzt.toLocaleString('ru-RU')}
                    </td>
                    <td className="border border-gray-900 p-1.5 text-right font-mono font-bold">
                      {sumWithoutVat.toLocaleString('ru-RU')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <table className="text-right text-xs font-mono">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 font-semibold text-gray-600">Итого без НДС:</td>
                  <td className="py-1 font-bold text-gray-900">{order.subtotalKzt.toLocaleString('ru-RU')} ₸</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-semibold text-gray-600">В том числе НДС (12%):</td>
                  <td className="py-1 font-bold text-gray-900">{order.vatKzt.toLocaleString('ru-RU')} ₸</td>
                </tr>
                <tr className="border-t border-gray-900 text-sm">
                  <td className="py-2 pr-4 font-bold text-gray-900">Всего к оплате с НДС:</td>
                  <td className="py-2 font-black text-gray-900">{order.totalKzt.toLocaleString('ru-RU')} ₸</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* In-Words Text Summary */}
          <div className="border-t border-gray-300 pt-3 mb-8 text-xs">
            <p className="text-gray-800">
              Всего наименований <strong>{order.items.length}</strong>, на сумму <strong>{order.totalKzt.toLocaleString('ru-RU')} KZT</strong> (в т.ч. НДС 12%).
            </p>
            {order.clientMessage && (
              <p className="text-gray-600 mt-1 italic text-[11px]">
                Примечание: {order.clientMessage}
              </p>
            )}
          </div>

          {/* Signatures, Stamps, and Official Facsimiles */}
          <div className="mt-8 pt-4 border-t border-gray-300 relative">
            <div className="grid grid-cols-2 gap-8 items-end">
              <div>
                <div className="flex items-baseline justify-between border-b border-gray-900 pb-1 mb-1">
                  <span className="font-semibold text-xs">Руководитель предприятия:</span>
                  <span className="font-medium text-xs font-serif italic text-gray-700">Искаков Е. М.</span>
                </div>
                <span className="text-[9px] text-gray-400 block text-right">подпись / расшифровка подписи</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-b border-gray-900 pb-1 mb-1">
                  <span className="font-semibold text-xs">Главный бухгалтер:</span>
                  <span className="font-medium text-xs font-serif italic text-gray-700">Жусупова А. С.</span>
                </div>
                <span className="text-[9px] text-gray-400 block text-right">подпись / расшифровка подписи</span>
              </div>
            </div>

            {/* Official Blue Stamp SVG */}
            <div className="absolute right-32 -bottom-2 pointer-events-none select-none opacity-85">
              <svg width="140" height="140" viewBox="0 0 160 160" className="text-blue-700">
                <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 2" opacity="0.8" />
                <circle cx="80" cy="80" r="66" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path id="curveTop" d="M 24,80 A 56,56 0 0,1 136,80" fill="none" />
                <path id="curveBottom" d="M 136,80 A 56,56 0 0,1 24,80" fill="none" />
                <text fontSize="8.5" fontWeight="bold" fill="currentColor" letterSpacing="1.2">
                  <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
                    ҚАЗАҚСТАН РЕСПУБЛИКАСЫ АЛМАТЫ ОБЛ.
                  </textPath>
                </text>
                <text fontSize="8.5" fontWeight="bold" fill="currentColor" letterSpacing="1.2">
                  <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
                    ТОО CHEMEXPRESS
                  </textPath>
                </text>
                <circle cx="80" cy="80" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                <text x="80" y="74" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">
                  БИН
                </text>
                <text x="80" y="87" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="monospace" fill="currentColor">
                  230740019280
                </text>
                <text x="80" y="99" textAnchor="middle" fontSize="8" fill="currentColor">
                  ДЛЯ ДОКУМЕНТОВ
                </text>
              </svg>
            </div>

            {/* QR Code for payment & 1C verification */}
            <div className="mt-8 flex items-center justify-between text-[10px] text-gray-400">
              <div className="flex items-center gap-2">
                <QrCode className="w-8 h-8 text-gray-800" />
                <span>Электронный счет 1С:Предприятие 8.3 • ChemExpress Module v2.4</span>
              </div>
              <div>
                Сформировано автоматически в B2B платформе ChemExpress
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
