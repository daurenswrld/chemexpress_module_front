import React from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { ProcurementCatalog } from './components/ProcurementCatalog';
import { Admin1CWorkstation } from './components/Admin1CWorkstation';
import { OrderDrawer } from './components/OrderDrawer';
import { DocumentPreview } from './components/DocumentPreview';
import { ToastContainer } from './components/Toast';
import { Building2, ShieldCheck, Database, FileSpreadsheet } from 'lucide-react';
import { COMPANY_SELLER_DETAILS } from './data/mockData';

export const App: React.FC = () => {
  const { currentView, previewOrder, setPreviewOrder, products, addToCart, openOrderDrawer } = useStore();

  // Support incoming deep-links from main site: ?product_id=140277&action=invoice
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productIdStr = params.get('product_id');
    const action = params.get('action') as 'invoice' | 'quote' | 'request' | null;

    if (productIdStr) {
      const prodId = Number(productIdStr);
      const product = products.find(p => p.id === prodId);
      if (product) {
        addToCart(product, 1);
        openOrderDrawer(action || 'invoice');
      }
    }
  }, [products, addToCart, openOrderDrawer]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-cyan-600 selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {currentView === 'catalog' ? (
          <ProcurementCatalog />
        ) : (
          <Admin1CWorkstation />
        )}
      </main>

      {/* B2B Order Slide-over Drawer (КП, Счет, Запрос) */}
      <OrderDrawer />

      {/* A4 Accounting Document Sheet (PDF/Print/1C XML) */}
      {previewOrder && (
        <DocumentPreview order={previewOrder} onClose={() => setPreviewOrder(null)} />
      )}

      {/* Pure SVG Toasts */}
      <ToastContainer />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-500 text-xs py-8 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-gray-900">{COMPANY_SELLER_DETAILS.name}</span>
            <span>•</span>
            <span className="font-mono text-gray-600">БИН {COMPANY_SELLER_DETAILS.bin}</span>
            <span>•</span>
            <span>{COMPANY_SELLER_DETAILS.legalAddress}</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              Официальный каталог (TCI, Macklin, ELK Bio)
            </span>
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              1C:Enterprise Совместимо
            </span>
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
              CommerceML 2.09
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
