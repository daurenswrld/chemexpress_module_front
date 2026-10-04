import React from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { ProcurementCatalog } from './components/ProcurementCatalog';
import { Admin1CWorkstation } from './components/Admin1CWorkstation';
import { AdminPanel } from './components/AdminPanel';
import { OrderDrawer } from './components/OrderDrawer';
import { DocumentPreview } from './components/DocumentPreview';
import { MyDocumentsModal } from './components/MyDocumentsModal';
import { AuthModal } from './components/AuthModal';
import { ClientCabinetModal } from './components/ClientCabinetModal';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';

import { StaffLoginPage } from './components/StaffLoginPage';

export const App: React.FC = () => {
  const { currentView, setCurrentView, previewOrder, setPreviewOrder, products, addToCart, openOrderDrawer, staffUser } = useStore();

  // Slug-based routing for Login (/login), Manager (/manager) and Admin (/admin) roles
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);

      const isLoginSlug = 
        path === '/login' || 
        path.startsWith('/login') || 
        path === '/auth' || 
        path.startsWith('/auth') || 
        params.get('view') === 'login' || 
        params.get('slug') === 'login' ||
        params.has('login') ||
        hash === '#login';

      const isAdminSlug = 
        path === '/admin' || 
        path.startsWith('/admin') || 
        params.get('view') === 'admin' || 
        params.get('slug') === 'admin' ||
        params.has('admin') ||
        hash === '#admin';

      const isManagerSlug = 
        path === '/manager' || 
        path === '/arm' || 
        path.startsWith('/manager') || 
        path.startsWith('/arm') || 
        params.get('view') === 'manager' || 
        params.get('slug') === 'manager' ||
        params.has('manager') || 
        params.has('arm') ||
        hash === '#manager';

      if (isLoginSlug) {
        if (useStore.getState().currentView !== 'login') {
          setCurrentView('login');
        }
      } else if (isAdminSlug) {
        const staff = useStore.getState().staffUser;
        if (!staff || staff.role !== 'admin') {
          window.history.replaceState({ view: 'login' }, '', '/login');
          if (useStore.getState().currentView !== 'login') {
            setCurrentView('login');
          }
        } else {
          if (useStore.getState().currentView !== 'admin') {
            setCurrentView('admin');
          }
        }
      } else if (isManagerSlug) {
        const staff = useStore.getState().staffUser;
        if (!staff) {
          window.history.replaceState({ view: 'login' }, '', '/login');
          if (useStore.getState().currentView !== 'login') {
            setCurrentView('login');
          }
        } else {
          if (useStore.getState().currentView !== 'manager') {
            setCurrentView('manager');
          }
        }
      } else {
        if (useStore.getState().currentView !== 'catalog') {
          setCurrentView('catalog');
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    const params = new URLSearchParams(window.location.search);
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

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [products, addToCart, openOrderDrawer, setCurrentView]);

  const isStaffLogin = currentView === 'login' || (!staffUser && (currentView === 'manager' || currentView === 'admin'));

  if (isStaffLogin) {
    return (
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
        <StaffLoginPage />
        <ToastContainer />
      </div>
    );
  }

  const isStaffWorkspace = currentView === 'manager' || currentView === 'admin';

  if (isStaffWorkspace) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          {currentView === 'manager' ? (
            <Admin1CWorkstation />
          ) : (
            <AdminPanel />
          )}
        </main>

        {/* A4 Accounting Document Sheet (PDF/Print/1C XML) */}
        {previewOrder && (
          <DocumentPreview order={previewOrder} onClose={() => setPreviewOrder(null)} />
        )}

        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-600 selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <ProcurementCatalog />
      </main>

      {/* B2B Order Slide-over Drawer (КП, Счет, Запрос) */}
      <OrderDrawer />

      {/* A4 Accounting Document Sheet (PDF/Print/1C XML) */}
      {previewOrder && (
        <DocumentPreview order={previewOrder} onClose={() => setPreviewOrder(null)} />
      )}

      {/* Client Documents History Modal */}
      <MyDocumentsModal />

      {/* Client Auth & Registration Modal */}
      <AuthModal />

      {/* Organization Client Cabinet Modal */}
      <ClientCabinetModal />

      {/* Floating Scroll To Top Widget */}
      <ScrollToTop />

      {/* Redesigned Corporate Footer */}
      <Footer />

      {/* Global Interactive Notifications */}
      <ToastContainer />
    </div>
  );
};

export default App;
