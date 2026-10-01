import React, { useEffect, useState } from 'react';
import type { Order } from '../types';
import { useStore } from '../store/useStore';
import { COMPANY_SELLER_DETAILS } from '../data/mockData';
import { 
  Printer, 
  Download, 
  Mail, 
  X, 
  Building2, 
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Check,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface DocumentPreviewProps {
  order: Order;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ order, onClose }) => {
  const { toggleOrderManagerConfirmation, addToast } = useStore();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(order.client.contactEmail || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

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

  const pdfFileName = `${docTitle} от ${formattedDate}`;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = pdfFileName;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();

    // Fallback restoration in case afterprint does not fire in some browsers
    setTimeout(() => {
      document.title = originalTitle;
    }, 3000);
  };

  const emailSubject = `${docTitle} от ИП «ChemExpress»`;
  const emailBody = `Здравствуйте, ${order.client.contactName || order.client.companyName || 'уважаемый партнер'}!\n\n` +
    `Направляем Вам ${docTitle} на сумму ${order.totalKzt.toLocaleString('ru-RU')} ₸ (${order.vatMode === 'vat16' ? 'с НДС 16%' : 'без НДС'}).\n` +
    `Срок действия документа: 5 календарных дней.\n\n` +
    `Количество позиций: ${order.items.length} шт.\n` +
    `Адрес поставки: ${order.client.deliveryAddress || 'Самовывоз / По согласованию'}\n\n` +
    `Реквизиты поставщика:\n` +
    `ИП «ChemExpress»\n` +
    `ИИН/БИН: ${COMPANY_SELLER_DETAILS.bin}\n` +
    `ИИК: ${COMPANY_SELLER_DETAILS.iik}\n` +
    `Банк: ${COMPANY_SELLER_DETAILS.bankName}\n` +
    `БИК: ${COMPANY_SELLER_DETAILS.bik}\n` +
    `Телефон: ${COMPANY_SELLER_DETAILS.phone}\n` +
    `Email: ${COMPANY_SELLER_DETAILS.email}\n` +
    `Сайт: https://chemexpress.kz`;

  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
    setSendSuccess(false);
  };

  const handleDirectSend = (e: React.FormEvent) => {
    e.preventDefault();
    const target = recipientEmail.trim();
    if (!target) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      addToast({
        type: 'success',
        title: 'Email отправлен',
        message: `${docTitle} поставлен в очередь отправки на ${target}`
      });
    }, 600);
  };

  const handleOpenNativeMail = () => {
    const target = recipientEmail.trim() || order.client.contactEmail || 'order@chemexpress.kz';
    const mailtoLink = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  const handleOpenGmail = () => {
    const target = recipientEmail.trim() || order.client.contactEmail || '';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(target)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyEmailText = () => {
    navigator.clipboard.writeText(emailBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };



  const isVat16 = order.vatMode === 'vat16';

  return (
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-3 sm:p-5 md:py-8 md:px-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print-document-modal">
      {/* Click outside to close */}
      <div 
        onClick={onClose}
        className="fixed inset-0 no-print"
      />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto border border-slate-200 z-10 print-document-container print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 print:overflow-visible print:max-h-none print:h-auto print:max-w-none print:w-full print:bg-white animate-in fade-in zoom-in-95 duration-150">
        
        {/* Action Header - Title on top, Buttons below */}
        <div className="p-4 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex flex-col gap-3 border-b border-slate-800 shrink-0 no-print">
          {/* Top Row: Title + Close Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold leading-tight truncate">{docTitle}</h3>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span>Статус:</span>
                  {order.isManagerConfirmed ? (
                    <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Подтверждено менеджером
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Предварительное (автоматическое)
                    </span>
                  )}
                  <span>• Срок: 5 дней</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Row: Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle confirmation for testing both statuses */}
            <button
              onClick={() => toggleOrderManagerConfirmation(order.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              title="Переключить статус проверки менеджером"
            >
              <span>{order.isManagerConfirmed ? 'Статус: Проверено' : 'Статус: Предварительное'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать А4</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              title="Сохранить как PDF через печать"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Strict A4 Accounting Standard) */}
        <div id="print-document-sheet" className="p-5 sm:p-7 overflow-y-auto flex-1 text-gray-900 bg-white font-sans text-xs leading-normal select-text print-document-sheet print:p-0 print:m-0 print:overflow-visible print:max-h-none print:border-none print:shadow-none">
          
          {/* Official Company Logo & Contact Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-900">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="ChemExpress Logo" 
                className="h-9 w-auto object-contain"
              />
              <div className="border-l border-gray-300 pl-3">
                <div className="font-extrabold text-gray-950 text-sm tracking-tight">{COMPANY_SELLER_DETAILS.name}</div>
                <div className="text-[10px] text-gray-500 font-medium">Поставка химических реактивов, стандартов и лабораторных систем</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-gray-600 space-y-0.5 font-mono">
              <div>Тел: <strong>{COMPANY_SELLER_DETAILS.phone}</strong></div>
              <div>Email: <strong>{COMPANY_SELLER_DETAILS.email}</strong></div>
              <div>Сайт: <strong>{COMPANY_SELLER_DETAILS.website}</strong></div>
            </div>
          </div>

          {/* Bank Payment Details Box (for Invoice) */}
          {isInvoice && (
            <div className="mb-3.5 border border-gray-400">
              <div className="text-[10px] text-gray-700 font-semibold p-1.5 bg-gray-50 border-b border-gray-300">
                Внимание! Оплата данного счета означает согласие с условиями поставки. Срок действия счета: 5 календарных дней. Товар резервируется после поступления оплаты.
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
          <div className="border-b-2 border-gray-900 pb-2 mb-3 flex items-baseline justify-between">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {docTitle} от {formattedDate.endsWith('г.') ? formattedDate : `${formattedDate} г.`}
            </h1>
            {validUntilDate && (
              <span className="text-xs text-gray-600 font-medium">
                Действителен до: <strong className="font-mono text-gray-900">{validUntilDate}</strong> (5 дней)
              </span>
            )}
          </div>

          {/* Supplier & Customer details */}
          <div className="space-y-2 mb-5 text-xs">
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
                Заявка покупателя через официальный B2B реестр ChemExpress ({order.orderNumber})
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-900 mb-4 text-[11px]">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-900 text-center">
                <th className="border border-gray-900 p-1.5 w-8">№</th>
                <th className="border border-gray-900 p-1.5 w-24">Артикул</th>
                <th className="border border-gray-900 p-1.5 text-left">Товары (реактивы, материалы)</th>
                <th className="border border-gray-900 p-1.5 w-16">Кол-во</th>
                <th className="border border-gray-900 p-1.5 w-12">Ед.</th>
                <th className="border border-gray-900 p-1.5 w-24 text-right">Цена, ₸</th>
                <th className="border border-gray-900 p-1.5 w-28 text-right">Сумма, ₸</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const sumRow = item.priceKzt * item.quantity;
                return (
                  <tr key={item.productId} className="border-b border-gray-300">
                    <td className="border border-gray-900 p-1.5 text-center font-mono">{index + 1}</td>
                    <td className="border border-gray-900 p-1.5 text-center font-mono text-[10px] text-gray-600">
                      {item.sku}
                    </td>
                    <td className="border border-gray-900 p-1.5 text-gray-900">
                      <div className="font-semibold leading-snug">{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-normal mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span>Фасовка: {item.packaging || '1 шт'}</span>
                        {item.casNumber && item.casNumber !== 'N/A' && (
                          <span>
                            • {item.casNumber.startsWith('Кат.') || item.casNumber.startsWith('Cat.') ? item.casNumber : `CAS: ${item.casNumber}`}
                          </span>
                        )}
                        {item.brand && (
                          <span>• Бренд: {item.brand}</span>
                        )}
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
                      {sumRow.toLocaleString('ru-RU')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mb-4">
            <table className="text-right text-xs font-mono">
              <tbody>
                {isVat16 ? (
                  <>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">Итого без НДС:</td>
                      <td className="py-1 font-bold text-gray-900">{order.subtotalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">В том числе НДС (16%):</td>
                      <td className="py-1 font-bold text-gray-900">{order.vatKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                    <tr className="border-t border-gray-900 text-sm">
                      <td className="py-1.5 pr-4 font-bold text-gray-900">Всего к оплате с НДС:</td>
                      <td className="py-1.5 font-black text-gray-900">{order.totalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">Итого:</td>
                      <td className="py-1 font-bold text-gray-900">{order.totalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">НДС:</td>
                      <td className="py-1 font-semibold text-gray-700">Без НДС (ИП на ОУР)</td>
                    </tr>
                    <tr className="border-t border-gray-900 text-sm">
                      <td className="py-1.5 pr-4 font-bold text-gray-900">Всего к оплате:</td>
                      <td className="py-1.5 font-black text-gray-900">{order.totalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* In-Words Text Summary */}
          <div className="border-t border-gray-300 pt-2.5 mb-4 text-xs">
            <p className="text-gray-800">
              Всего наименований <strong>{order.items.length}</strong>, на сумму <strong>{order.totalKzt.toLocaleString('ru-RU')} KZT</strong> {isVat16 ? '(в т.ч. НДС 16%)' : '(Без НДС)'}.
            </p>
            {order.clientMessage && (
              <p className="text-gray-600 mt-1 italic text-[11px]">
                Примечание заказчика: {order.clientMessage}
              </p>
            )}
          </div>

          {/* Mandatory Status Disclaimers per Client Requirements */}
          {isQuote && (
            <div className="mb-5 print:mb-2 p-3 print:p-2 rounded-lg border text-[11px] leading-relaxed select-text">
              {order.isManagerConfirmed ? (
                <div className="bg-emerald-50/70 border-emerald-300 text-emerald-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">Статус: коммерческое предложение подтверждено менеджером.</div>
                  <div>Наличие и сроки актуальны на момент подтверждения. Товар не резервируется до поступления оплаты, если иное не согласовано письменно.</div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border-amber-300 text-amber-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">Статус: предварительное коммерческое предложение.</div>
                  <div>Документ сформирован автоматически и не утвержден менеджером по продажам/РОП. Указанные цены, наличие и сроки поставки подлежат подтверждению. Товар не резервируется до подтверждения заказа и поступления оплаты.</div>
                </div>
              )}
            </div>
          )}

          {isInvoice && (
            <div className="mb-5 print:mb-2 p-3 print:p-2 rounded-lg border text-[11px] leading-relaxed select-text">
              {!order.isManagerConfirmed ? (
                <div className="bg-amber-50/70 border-amber-300 text-amber-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">Статус: предварительный счёт на оплату.</div>
                  <div>Документ сформирован автоматически и не утвержден менеджером по продажам/РОП. Срок действия счёта: 5 календарных дней. Указанные цены, наличие и сроки поставки подлежат подтверждению. Товар не резервируется до подтверждения заказа и поступления оплаты.</div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border-emerald-300 text-emerald-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">Статус: счёт на оплату подтвержден менеджером.</div>
                  <div>Срок действия счёта: 5 календарных дней. Товар резервируется после поступления оплаты на расчётный счёт, если иное не согласовано письменно.</div>
                </div>
              )}
            </div>
          )}

          {/* Signatures, Stamps, and Official Facsimiles */}
          <div className="mt-6 pt-3 print:mt-2 print:pt-1 border-t border-gray-300 relative">
            <div className="grid grid-cols-2 gap-8 items-end">
              <div>
                <div className="flex items-baseline justify-between border-b border-gray-900 pb-1 mb-1">
                  <span className="font-semibold text-xs">Руководитель (ИП):</span>
                  <span className="font-medium text-xs font-serif italic text-gray-800">
                    {COMPANY_SELLER_DETAILS.directorName}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 block text-right">подпись / расшифровка подписи</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-b border-gray-900 pb-1 mb-1">
                  <span className="font-semibold text-xs">Главный бухгалтер:</span>
                  <span className="font-medium text-xs text-gray-600 italic">
                    {COMPANY_SELLER_DETAILS.chiefAccountantName}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 block text-right">для ИП не предусмотрен законодательством РК</span>
              </div>
            </div>

            {/* Official Blue Stamp SVG for ИП CHEMEXPRESS */}
            <div className="absolute right-28 -bottom-1 pointer-events-none select-none opacity-85">
              <svg width="135" height="135" viewBox="0 0 160 160" className="text-blue-700">
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
                    ИП CHEMEXPRESS
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

            {/* Document Footer Line */}
            <div className="mt-8 print:mt-2 flex items-center justify-between text-[10px] text-gray-400">
              <div>
                Официальный B2B модуль ChemExpress • chemexpress.kz
              </div>
              <div>
                Сформировано автоматически в платформе ChemExpress
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Email Dispatch Modal */}
      {isEmailModalOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-in fade-in duration-150"
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-600/30 text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Отправка документа по Email</h4>
                  <p className="text-[11px] text-gray-400">{docTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {sendSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center animate-in fade-in duration-150">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">Документ успешно отправлен!</h5>
                  <p className="text-slate-600 text-xs">
                    Электронная копия направлена на адрес: <strong>{recipientEmail}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Копия зарегистрирована в журнале исходящей корреспонденции ChemExpress.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDirectSend} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                      Email получателя:
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      placeholder="client@company.kz"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-navy-900 focus:bg-white transition-colors"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Укажите адрес клиента или бухгалтерии для отправки документа.
                    </span>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Сумма к оплате:</span>
                      <strong className="text-slate-900 font-bold">{order.totalKzt.toLocaleString('ru-RU')} ₸</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Режим налогообложения:</span>
                      <strong className="text-slate-800">{order.vatMode === 'vat16' ? 'С НДС (16%)' : 'Без НДС (ИП на ОУР)'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Срок действия:</span>
                      <strong className="text-slate-800">5 календарных дней</strong>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Отправка документа...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Отправить на email</span>
                      </>
                    )}
                  </button>

                  {/* Alternative Fast Channels */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Быстрые способы открытия:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={handleOpenGmail}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Открыть черновик письма в Gmail"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
                        <span>В Gmail</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenNativeMail}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Открыть в установленном Outlook или Mail"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Outlook / Mail</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyEmailText}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Скопировать готовый текст письма в буфер"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Скопировано!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Копировать</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
