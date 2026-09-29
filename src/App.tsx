import React from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { ProcurementCatalog } from './components/ProcurementCatalog';
import { Admin1CWorkstation } from './components/Admin1CWorkstation';
import { OrderDrawer } from './components/OrderDrawer';
import { DocumentPreview } from './components/DocumentPreview';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const { currentView, setCurrentView, previewOrder, setPreviewOrder, products, addToCart, openOrderDrawer } = useStore();

  // Support incoming deep-links from main site: ?product_id=... / ?sku=... & action=invoice / quote, and ?view=admin
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'admin') {
      setCurrentView('admin');
    }

    const productIdStr = params.get('product_id');
    const skuParam = params.get('sku')?.toLowerCase();
    const action = (params.get('action') || params.get('order')) as 'invoice' | 'quote' | 'request' | null;

    if (productIdStr || skuParam) {
      const prodId = productIdStr ? Number(productIdStr) : null;
      const product = products.find(p => 
        (prodId && p.id === prodId) || 
        (skuParam && (p.product_code?.toLowerCase() === skuParam || p.cat_no?.toLowerCase() === skuParam))
      );
      if (product) {
        addToCart(product, 1);
        openOrderDrawer(action || 'invoice');
      }
    }
  }, [products, addToCart, openOrderDrawer, setCurrentView]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-600 selection:text-white">
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

      {/* Redesigned Corporate Footer */}
      <Footer />
    </div>
  );
};

export default App;
