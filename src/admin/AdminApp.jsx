import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './layout/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { OverviewPage } from './pages/OverviewPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { CouponsPage } from './pages/CouponsPage';
import { HomepageCMSPage } from './pages/HomepageCMSPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AnalyticsReportsPage } from './pages/AnalyticsReportsPage';
import { StaffPermissionsPage } from './pages/StaffPermissionsPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { StoreSettingsPage } from './pages/StoreSettingsPage';
import { ReturnsPage } from './pages/ReturnsPage';

function AdminContent() {
  const { isAuthenticated, loading } = useAdminAuth();
  const [route, setRoute] = useState(() => window.location.hash || '#admin/dashboard');

  useEffect(() => {
    const handleHash = () => {
      setRoute(window.location.hash || '#admin/dashboard');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F1] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#4A0715] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-serif text-xs uppercase tracking-widest text-[#4A0715] font-semibold">
            Connecting to Atelier Backend...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in, show Admin Login
  if (!isAuthenticated || route === '#admin/login') {
    return <AdminLogin onSuccess={() => (window.location.hash = '#admin/dashboard')} />;
  }

  // Determine active tab from route
  // Clean #admin/xxx?params
  const cleanRoute = route.replace(/^#\/?admin\/?/, '').split('?')[0] || 'dashboard';

  let activeTab = cleanRoute;
  if (cleanRoute === '' || cleanRoute === 'overview') activeTab = 'dashboard';

  let pageComponent;
  switch (activeTab) {
    case 'products':
      pageComponent = <ProductsPage />;
      break;
    case 'categories':
      pageComponent = <CategoriesPage />;
      break;
    case 'collections':
      pageComponent = <CollectionsPage />;
      break;
    case 'orders':
      pageComponent = <OrdersPage />;
      break;
    case 'inventory':
      pageComponent = <InventoryPage />;
      break;
    case 'returns':
      pageComponent = <ReturnsPage />;
      break;
    case 'customers':
      pageComponent = <CustomersPage />;
      break;
    case 'coupons':
      pageComponent = <CouponsPage />;
      break;
    case 'homepage':
    case 'content':
      pageComponent = <HomepageCMSPage />;
      break;
    case 'reviews':
      pageComponent = <ReviewsPage />;
      break;
    case 'analytics':
    case 'reports':
      pageComponent = <AnalyticsReportsPage />;
      break;
    case 'staff':
      pageComponent = <StaffPermissionsPage />;
      break;
    case 'activity-logs':
      pageComponent = <ActivityLogsPage />;
      break;
    case 'settings':
      pageComponent = <StoreSettingsPage />;
      break;
    case 'dashboard':
    default:
      pageComponent = <OverviewPage onNavigate={(tab) => (window.location.hash = `#admin/${tab}`)} />;
      break;
  }

  return (
    <AdminLayout activeTab={activeTab} onNavigate={(tab) => (window.location.hash = `#admin/${tab}`)}>
      {pageComponent}
    </AdminLayout>
  );
}

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
}

export default AdminApp;

