import React, { useEffect, useState } from 'react';
import type { Order } from '../types';
import { COMPANY_SELLER_DETAILS } from '../data/mockData';
import { getLegalDocumentItemName } from '../utils/productLocalization';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  Loader2,
  Globe
} from 'lucide-react';

interface DocumentPreviewProps {
  order: Order;
  onClose: () => void;
}

const KZ_MONTHS = [
  'қаңтар',
  'ақпан',
  'наурыз',
  'сәуір',
  'мамыр',
  'маусым',
  'шілде',
  'тамыз',
  'қыркүйек',
  'қазан',
  'қараша',
  'желтоқсан',
];

const RU_MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const formatDocumentDate = (dateInput: string | Date | undefined, lang: 'ru' | 'kz' | 'en'): string => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const year = d.getFullYear();

  if (lang === 'kz') {
    return `${day} ${KZ_MONTHS[d.getMonth()]} ${year} ж.`;
  }
  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `${day} ${RU_MONTHS[d.getMonth()]} ${year} г.`;
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ order, onClose }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(order.client.contactEmail || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [docLang, setDocLang] = useState<'ru' | 'kz' | 'en'>('ru');

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

  const docTitle = docLang === 'en'
    ? (isInvoice ? `Commercial Invoice No. ${order.orderNumber}` : isQuote ? `Commercial Quotation No. ${order.orderNumber}` : `Purchase Order No. ${order.orderNumber}`)
    : docLang === 'kz'
    ? (isInvoice ? `Төлем шоты № ${order.orderNumber}` : isQuote ? `Коммерциялық ұсыныс № ${order.orderNumber}` : `Тауар жеткізуге өтінім № ${order.orderNumber}`)
    : (isInvoice ? `Счет на оплату № ${order.orderNumber}` : isQuote ? `Коммерческое предложение № ${order.orderNumber}` : `Заявка на поставку № ${order.orderNumber}`);

  const formattedDate = formatDocumentDate(order.createdAt, docLang);
  const validUntilDate = order.validUntil ? formatDocumentDate(order.validUntil, docLang) : '';

  const pdfFileName = `${docTitle} (${formattedDate})`;

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

  const handleDownloadPdf = async () => {
    const sheetElement = document.getElementById('print-document-sheet');
    if (!sheetElement || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const prevScrollTop = sheetElement.scrollTop;
      sheetElement.scrollTop = 0;

      const canvas = await html2canvas(sheetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const clonedSheet = clonedDoc.getElementById('print-document-sheet');
          if (clonedSheet) {
            clonedSheet.style.overflow = 'visible';
            clonedSheet.style.maxHeight = 'none';
            clonedSheet.style.height = 'auto';
            clonedSheet.style.padding = '24px';
          }
        },
      });

      sheetElement.scrollTop = prevScrollTop;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = 297;

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      }

      const safeFileName = `${docTitle.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
      pdf.save(safeFileName);
    } catch (err) {
      console.error('Error generating PDF directly:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
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
    }, 600);
  };

  const handleOpenNativeMail = () => {
    const target = recipientEmail.trim() || order.client.contactEmail || COMPANY_SELLER_DETAILS.email;
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
                      Предварительное
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

          {/* Bottom Row: Language Switcher + Action Buttons */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Language Selector: RU (KZ standard) / KZ (State lang) / EN (International) */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-semibold px-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span style={{lineHeight:0}}>Язык документа:</span>
              </span>
              <button
                type="button"
                onClick={() => setDocLang('ru')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  docLang === 'ru'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Официальный формат РК на русском языке (по закону РК)"
              >
                Русский
              </button>
              <button
                type="button"
                onClick={() => setDocLang('kz')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  docLang === 'kz'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Қазақ тіліндегі ресми бланкі"
              >
                Қазақша
              </button>
              <button
                type="button"
                onClick={() => setDocLang('en')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  docLang === 'en'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="International Commercial Format in English"
              >
                English
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Печать А4</span>
              </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Скачать готовый PDF-файл напрямую на устройство"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Формирование...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PDF</span>
                </>
              )}
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
                <div className="text-[10px] text-gray-500 font-medium">{COMPANY_SELLER_DETAILS.slogan}</div>
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
                {!order.isManagerConfirmed ? (
                  <span>
                    Внимание! Счёт сформирован автоматически и является предварительным. Стоимость доставки в сумму счёта не включена. Стоимость и условия доставки необходимо согласовать с менеджером до оплаты. Срок действия счёта — 5 календарных дней.
                  </span>
                ) : (
                  <span>
                    Внимание! Счёт и условия доставки подтверждены менеджером ChemExpress. Срок действия счёта — 5 календарных дней. Товар резервируется после поступления оплаты на расчётный счёт.
                  </span>
                )}
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
          <div className="border-b-2 border-gray-900 pb-3 mb-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
              <span>{docTitle}</span>{' '}
              <span className="whitespace-nowrap font-bold text-gray-800">
                {docLang === 'en' ? `dated ${formattedDate}` : `${docLang === 'kz' ? 'күні' : 'от'} ${formattedDate}`}
              </span>
            </h1>
            {validUntilDate && (
              <div className="text-xs text-gray-600 font-medium shrink-0 whitespace-nowrap ml-auto pt-0.5">
                <span className="text-gray-500">
                  {docLang === 'en' ? 'Valid until:' : docLang === 'kz' ? 'Жарамдылық мерзімі:' : 'Действителен до:'}
                </span>{' '}
                <strong className="font-mono text-gray-900 font-bold ml-1">{validUntilDate}</strong>
                <span className="text-gray-500 ml-1.5 font-normal">
                  ({docLang === 'en' ? '5 days' : docLang === 'kz' ? '5 күн' : '5 дней'})
                </span>
              </div>
            )}
          </div>

          {/* Supplier & Customer details */}
          <div className="space-y-2 mb-5 text-xs">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-2 font-bold text-gray-700">
                {docLang === 'en' ? 'Supplier:' : docLang === 'kz' ? 'Жеткізуші (Сатушы):' : 'Поставщик:'}
              </span>
              <div className="col-span-10 text-gray-900 leading-snug">
                <strong>{COMPANY_SELLER_DETAILS.name}</strong>, {docLang === 'en' ? 'BIN' : 'БИН'}: {COMPANY_SELLER_DETAILS.bin}, {docLang === 'en' ? 'OKED' : 'ОКЭД'}: {COMPANY_SELLER_DETAILS.oked}, {COMPANY_SELLER_DETAILS.legalAddress}, {docLang === 'en' ? 'tel.' : 'тел.'}: {COMPANY_SELLER_DETAILS.phone}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-2 font-bold text-gray-700">
                {docLang === 'en' ? 'Customer / Buyer:' : docLang === 'kz' ? 'Сатып алушы:' : 'Покупатель:'}
              </span>
              <div className="col-span-10 text-gray-900 leading-snug">
                <strong>{order.client.companyName}</strong>, {docLang === 'en' ? 'BIN' : 'БИН'} {order.client.bin}, {order.client.deliveryAddress}
                {order.client.contactPhone && `, ${docLang === 'en' ? 'tel.' : 'тел.'}: ${order.client.contactPhone}`}
                {order.client.contactEmail && `, email: ${order.client.contactEmail}`}
              </div>
            </div>

            {/* Delivery Terms & Dispatch Info */}
            <div className="grid grid-cols-12 gap-2 pt-1 border-t border-gray-200">
              <span className="col-span-2 font-bold text-gray-700">
                {docLang === 'en' ? 'Delivery Terms:' : docLang === 'kz' ? 'Жеткізу шарттары:' : 'Условия доставки:'}
              </span>
              <div className="col-span-10 text-gray-900 leading-snug">
                {order.isManagerConfirmed ? (
                  <div className="space-y-0.5">
                    <div>
                      {docLang === 'en' ? 'Delivery Address:' : docLang === 'kz' ? 'Жеткізу мекенжайы:' : 'Адрес доставки:'}{' '}
                      <strong>{order.deliveryAddress || order.client.deliveryAddress || (docLang === 'en' ? 'As agreed with customer' : docLang === 'kz' ? 'Тапсырыс берушімен келісім бойынша' : 'По согласованию с заказчиком')}</strong>
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {docLang === 'en' ? 'Delivery time:' : docLang === 'kz' ? 'Жеткізу мерзімі:' : 'Срок поставки:'}{' '}
                      <strong className="text-gray-900">{order.deliveryDays || (docLang === 'en' ? '1-3 business days (ex stock)' : docLang === 'kz' ? '1-3 жұмыс күні (қоймадан)' : '1-3 рабочих дня (со склада)')}</strong>
                      {' • '}
                      {docLang === 'en' ? 'Delivery:' : docLang === 'kz' ? 'Жеткізу:' : 'Доставка:'}{' '}
                      <strong className="text-gray-900">
                        {order.deliveryCostKzt && order.deliveryCostKzt > 0 
                          ? `${order.deliveryCostKzt.toLocaleString('ru-RU')} ₸` 
                          : (docLang === 'en' ? 'Included in price (Free)' : docLang === 'kz' ? 'Құнға кіреді (Тегін)' : 'Включена в стоимость (Бесплатно)')}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-800 bg-amber-50/70 p-1.5 rounded border border-amber-200 text-[11px] leading-relaxed">
                    <strong>{docLang === 'en' ? 'Preliminary estimate (excl. logistics):' : docLang === 'kz' ? 'Алдын ала есеп (логистикасыз):' : 'Предварительный расчет (без учета логистики):'}</strong> {docLang === 'en' ? 'Address:' : docLang === 'kz' ? 'Мекенжай:' : 'адрес:'} {order.client.deliveryAddress || (docLang === 'en' ? 'TBD' : 'Уточняется')}. {docLang === 'en' ? 'Final delivery terms and costs will be finalized by manager upon confirmation.' : docLang === 'kz' ? 'Жеткізу мерзімі мен құнын тапсырысты растау алдында менеджер есептейді.' : 'Точный срок и стоимость доставки рассчитываются менеджером по продажам перед утверждением заказа.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-900 mb-4 text-[11px]">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-900 text-center">
                <th className="border border-gray-900 p-1.5 w-8">{docLang === 'en' ? 'No.' : '№'}</th>
                <th className="border border-gray-900 p-1.5 w-24">{docLang === 'en' ? 'SKU / Code' : 'Артикул'}</th>
                <th className="border border-gray-900 p-1.5 text-left">
                  {docLang === 'en' ? 'Products & Chemical Reagents' : docLang === 'kz' ? 'Тауарлар (реактивтер, материалдар)' : 'Товары (реактивы, материалы)'}
                </th>
                <th className="border border-gray-900 p-1.5 w-16">{docLang === 'en' ? 'Qty' : docLang === 'kz' ? 'Саны' : 'Кол-во'}</th>
                <th className="border border-gray-900 p-1.5 w-12">{docLang === 'en' ? 'Unit' : docLang === 'kz' ? 'Өлшем' : 'Ед.'}</th>
                <th className="border border-gray-900 p-1.5 w-24 text-right">{docLang === 'en' ? 'Price, ₸' : docLang === 'kz' ? 'Бағасы, ₸' : 'Цена, ₸'}</th>
                <th className="border border-gray-900 p-1.5 w-28 text-right">{docLang === 'en' ? 'Total, ₸' : docLang === 'kz' ? 'Сомасы, ₸' : 'Сумма, ₸'}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const sumRow = item.priceKzt * item.quantity;
                const { officialTitle, internationalSubtitle } = getLegalDocumentItemName(item, docLang);

                return (
                  <tr key={item.productId} className="border-b border-gray-300">
                    <td className="border border-gray-900 p-1.5 text-center font-mono">{index + 1}</td>
                    <td className="border border-gray-900 p-1.5 text-center font-mono text-[10px] text-gray-600">
                      {item.sku}
                    </td>
                    <td className="border border-gray-900 p-1.5 text-gray-900">
                      <div className="font-semibold leading-snug">{officialTitle}</div>
                      {internationalSubtitle && (
                        <div className="text-[10px] text-gray-600 font-normal mt-0.5 font-mono">
                          {internationalSubtitle}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500 font-normal mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span>{docLang === 'en' ? 'Packaging:' : docLang === 'kz' ? 'Қаптамасы:' : 'Фасовка:'} {item.packaging || '1 шт'}</span>
                        {item.brand && (
                          <span>• {docLang === 'en' ? 'Brand:' : docLang === 'kz' ? 'Бренд:' : 'Бренд:'} {item.brand}</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-900 p-1.5 text-center font-mono font-bold">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-900 p-1.5 text-center">
                      {docLang === 'en' ? 'pcs' : docLang === 'kz' ? 'дн' : 'шт'}
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
                      <td className="py-1 pr-4 font-semibold text-gray-600">
                        {docLang === 'en' ? 'Items total (excl. VAT):' : docLang === 'kz' ? 'ҚҚС-сыз тауарлар сомасы:' : 'Итого товары без НДС:'}
                      </td>
                      <td className="py-1 font-bold text-gray-900">{order.subtotalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">
                        {docLang === 'en' ? 'VAT (16%):' : docLang === 'kz' ? 'ҚҚС (16%):' : 'В том числе НДС (16%):'}
                      </td>
                      <td className="py-1 font-bold text-gray-900">{order.vatKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                    {order.deliveryCostKzt && order.deliveryCostKzt > 0 ? (
                      <tr>
                        <td className="py-1 pr-4 font-semibold text-gray-600">
                          {docLang === 'en' ? 'Delivery:' : docLang === 'kz' ? 'Жеткізу:' : 'Доставка:'}
                        </td>
                        <td className="py-1 font-bold text-gray-900">{order.deliveryCostKzt.toLocaleString('ru-RU')} ₸</td>
                      </tr>
                    ) : null}
                    <tr className="border-t border-gray-900 text-sm">
                      <td className="py-1.5 pr-4 font-bold text-gray-900">
                        {docLang === 'en' ? 'Total with VAT:' : docLang === 'kz' ? 'ҚҚС-пен барлық төлем:' : 'Всего к оплате с НДС:'}
                      </td>
                      <td className="py-1.5 font-black text-gray-900">{order.totalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">
                        {docLang === 'en' ? 'Items total:' : docLang === 'kz' ? 'Тауарлар бойынша барлығы:' : 'Итого по товарам:'}
                      </td>
                      <td className="py-1 font-bold text-gray-900">{order.subtotalKzt.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4 font-semibold text-gray-600">
                        {docLang === 'en' ? 'VAT:' : docLang === 'kz' ? 'ҚҚС:' : 'НДС:'}
                      </td>
                      <td className="py-1 font-semibold text-gray-700">
                        {docLang === 'en' ? 'VAT Exempt (General Tax Regime)' : docLang === 'kz' ? 'ҚҚС-сыз (ЖСР режимі)' : 'Без НДС (ИП на ОУР)'}
                      </td>
                    </tr>
                    {order.deliveryCostKzt && order.deliveryCostKzt > 0 ? (
                      <tr>
                        <td className="py-1 pr-4 font-semibold text-gray-600">
                          {docLang === 'en' ? 'Delivery:' : docLang === 'kz' ? 'Жеткізу:' : 'Доставка:'}
                        </td>
                        <td className="py-1 font-bold text-gray-900">{order.deliveryCostKzt.toLocaleString('ru-RU')} ₸</td>
                      </tr>
                    ) : null}
                    <tr className="border-t border-gray-900 text-sm">
                      <td className="py-1.5 pr-4 font-bold text-gray-900">
                        {docLang === 'en' ? 'Total Due:' : docLang === 'kz' ? 'Төлеуге барлығы:' : 'Всего к оплате:'}
                      </td>
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
              {docLang === 'en'
                ? `Total items: ${order.items.length}, total amount: ${order.totalKzt.toLocaleString('ru-RU')} KZT ${isVat16 ? '(incl. VAT 16%)' : '(VAT exempt)'}.`
                : docLang === 'kz'
                ? `Барлық атаулар саны: ${order.items.length}, жалпы сомасы: ${order.totalKzt.toLocaleString('ru-RU')} KZT ${isVat16 ? '(ҚҚС 16% қоса)' : '(ҚҚС-сыз)'}.`
                : `Всего наименований: ${order.items.length}, на сумму: ${order.totalKzt.toLocaleString('ru-RU')} KZT ${isVat16 ? '(в т.ч. НДС 16%)' : '(Без НДС)'}.`}
            </p>
            {isQuote && !order.isManagerConfirmed && (
              <p className="text-gray-900 mt-2 text-[11px] leading-relaxed">
                <strong>{docLang === 'en' ? 'Note:' : docLang === 'kz' ? 'Ескертпе:' : 'Примечание:'}</strong>{' '}
                {docLang === 'en'
                  ? 'Delivery cost is not included in the quote prices. Final shipping costs and timeline are confirmed with manager before dispatch.'
                  : docLang === 'kz'
                  ? 'Жеткізу құны бағаға кірмеген. Жеткізу шарттары мен құнын төлеу алдында менеджермен келісу қажет.'
                  : 'Стоимость доставки в указанные цены не включена. Стоимость и условия доставки необходимо согласовать с менеджером.'}
              </p>
            )}
            {order.clientMessage && (
              <p className="text-gray-600 mt-1.5 italic text-[11px]">
                {docLang === 'en' ? 'Customer comment:' : docLang === 'kz' ? 'Тапсырыс берушінің ескертпесі:' : 'Примечание заказчика:'} {order.clientMessage}
              </p>
            )}
          </div>

          {/* Mandatory Status Disclaimers per Client Requirements */}
          {isQuote && (
            <div className="mb-5 print:mb-2 p-3 print:p-2 rounded-lg border text-[11px] leading-relaxed select-text">
              {order.isManagerConfirmed ? (
                <div className="bg-emerald-50/70 border-emerald-300 text-emerald-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">
                    {docLang === 'en' 
                      ? 'Status: quotation confirmed by manager.'
                      : docLang === 'kz'
                      ? 'Мәртебесі: коммерциялық ұсынысты менеджер растады.'
                      : 'Статус: коммерческое предложение подтверждено менеджером.'}
                  </div>
                  <div>
                    {docLang === 'en'
                      ? 'Availability and terms are actual at confirmation. Goods are not reserved until payment is received unless agreed in writing.'
                      : docLang === 'kz'
                      ? 'Тауардың қолжетімділігі мен мерзімдері расталған сәтте өзекті. Жазбаша келісілмесе, төлем түскенге дейін тауар брондалмайды.'
                      : 'Наличие и сроки актуальны на момент подтверждения. Товар не резервируется до поступления оплаты, если иное не согласовано письменно.'}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border-amber-300 text-amber-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">
                    {docLang === 'en'
                      ? 'Status: preliminary commercial quotation.'
                      : docLang === 'kz'
                      ? 'Мәртебесі: алдын ала коммерциялық ұсыныс.'
                      : 'Статус: предварительное коммерческое предложение.'}
                  </div>
                  <div>
                    {docLang === 'en'
                      ? 'The document is generated automatically and not yet approved by sales manager. Shipping cost is not included in prices. Prices and availability are subject to confirmation.'
                      : docLang === 'kz'
                      ? 'Құжат автоматты түрде жасалған және менеджермен бекітілмеген. Жеткізу құны бағаға кірмеген. Көрсетілген бағалар, қолжетімділік және жеткізу мерзімдері расталуы тиіс.'
                      : 'Документ сформирован автоматически и не утвержден менеджером по продажам/РОП. Стоимость доставки в указанные цены не включена. Стоимость и условия доставки необходимо согласовать с менеджером. Указанные цены, наличие и сроки поставки подлежат подтверждению. Товар не резервируется до подтверждения заказа и поступления оплаты.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {isInvoice && (
            <div className="mb-5 print:mb-2 p-3 print:p-2 rounded-lg border text-[11px] leading-relaxed select-text">
              {!order.isManagerConfirmed ? (
                <div className="bg-amber-50/70 border-amber-300 text-amber-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">
                    {docLang === 'en'
                      ? 'Status: preliminary payment invoice.'
                      : docLang === 'kz'
                      ? 'Мәртебесі: алдын ала төлем шоты.'
                      : 'Статус: предварительный счёт на оплату.'}
                  </div>
                  <div>
                    {docLang === 'en'
                      ? 'The document is generated automatically. Validity period: 5 calendar days. Prices and availability are subject to confirmation.'
                      : docLang === 'kz'
                      ? 'Құжат автоматты түрде жасалған және менеджермен бекітілмеген. Шоттың жарамдылық мерзімі: 5 күнтізбелік күн. Көрсетілген бағалар, қолжетімділік және жеткізу мерзімдері расталуы тиіс.'
                      : 'Документ сформирован автоматически и не утвержден менеджером по продажам/РОП. Срок действия счёта: 5 календарных дней. Указанные цены, наличие и сроки поставки подлежат подтверждению. Товар не резервируется до подтверждения заказа и поступления оплаты.'}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border-emerald-300 text-emerald-950 p-2.5 rounded">
                  <div className="font-bold mb-0.5">
                    {docLang === 'en'
                      ? 'Status: invoice confirmed by manager.'
                      : docLang === 'kz'
                      ? 'Мәртебесі: төлем шотын менеджер растады.'
                      : 'Статус: счёт на оплату подтвержден менеджером.'}
                  </div>
                  <div>
                    {docLang === 'en'
                      ? 'Invoice validity: 5 calendar days. Goods are reserved after payment arrives to bank account.'
                      : docLang === 'kz'
                      ? 'Шоттың жарамдылық мерзімі: 5 күнтізбелік күн. Тауар банктік есеп айырысу шотына төлем түскеннен кейін брондалады.'
                      : 'Срок действия счёта: 5 календарных дней. Товар резервируется после поступления оплаты на расчётный счёт, если иное не согласовано письменно.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Signatures, Stamps, and Official Facsimiles */}
          <div className="mt-6 pt-3 print:mt-2 print:pt-1 border-t border-gray-300 relative">
            <div className="grid grid-cols-2 gap-8 items-end">
              <div>
                <div className="flex items-baseline justify-between border-b border-gray-900 pb-1 mb-1">
                  <span className="font-semibold text-xs">
                    {docLang === 'en' ? 'Director (Sole Prop.):' : docLang === 'kz' ? 'Басшы (ЖК):' : 'Руководитель (ИП):'}
                  </span>
                  <span className="font-medium text-xs font-serif italic text-gray-800">
                    {COMPANY_SELLER_DETAILS.directorName}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 block text-right">
                  {docLang === 'en' ? 'signature / full name' : docLang === 'kz' ? 'қолы / қолды таратып жазу' : 'подпись / расшифровка подписи'}
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-b border-gray-900 pb-1 mb-1">
                  <span className="font-semibold text-xs">
                    {docLang === 'en' ? 'Chief Accountant:' : docLang === 'kz' ? 'Бас бухгалтер:' : 'Главный бухгалтер:'}
                  </span>
                  <span className="font-medium text-xs text-gray-600 italic">
                    {COMPANY_SELLER_DETAILS.chiefAccountantName}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 block text-right">
                  {docLang === 'en' ? 'not required for sole prop. by RK law' : docLang === 'kz' ? 'ҚР заңнамасы бойынша ЖК үшін көзделмеген' : 'для ИП не предусмотрен законодательством РК'}
                </span>
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
