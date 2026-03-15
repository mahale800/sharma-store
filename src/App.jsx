import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MissingConfigWarning from './components/MissingConfigWarning';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));

// Checkout Flow
const CheckoutLayout = lazy(() => import('./layouts/CheckoutLayout'));
const Address = lazy(() => import('./pages/checkout/Address'));
const Payment = lazy(() => import('./pages/checkout/Payment'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

// User Pages
const Account = lazy(() => import('./pages/Account'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const Products = lazy(() => import('./pages/admin/Products'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetails = lazy(() => import('./pages/admin/AdminOrderDetails'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));
const AdminRoadmap = lazy(() => import('./pages/admin/AdminRoadmap'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards'));
import AdminErrorBoundary from './components/admin/AdminErrorBoundary';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

import Preloader from './components/Preloader';
import SplashScreen from './components/common/SplashScreen';
// import Footer from './components/Footer';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import { CartProvider } from './context/CartContext';
import { ShopProvider } from './context/ShopContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

import './App.css';
import { useEngagement } from './hooks/useEngagement';

// Separated Routes Component to use useLocation
const AppRoutes = () => {
  const location = useLocation();
  const { logEvent } = useEngagement();

  useEffect(() => {
    logEvent('page_view', 'organic', { path: location.pathname });
  }, [location.pathname, logEvent]);

  return (
    // Removed AnimatePresence here because it causes Layouts to unmount.
    // We handle transitions INSIDE Layouts now.
    <Routes location={location}>
      {/* --- Standalone Routes --- */}
      <Route path="/login" element={<Login />} />


      {/* --- Public Customer Routes --- */}
      <Route element={
        <GlobalErrorBoundary>
          <PublicLayout />
        </GlobalErrorBoundary>
      }>
        <Route path="/" element={<Home />} />
        {/* Login moved out to avoid PublicLayout padding */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/products" element={<Shop />} />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/order/:orderId" element={<OrderDetails />} />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/track-order/:orderId" element={<TrackOrder />} />
      </Route>



      {/* --- Checkout Flow (Standalone Layout) --- */}
      <Route path="/checkout" element={
        <GlobalErrorBoundary>
          <ProtectedRoute>
            <CheckoutLayout />
          </ProtectedRoute>
        </GlobalErrorBoundary>
      }>
        <Route index element={<Navigate to="address" replace />} />
        <Route path="address" element={<Address />} />
        <Route path="payment" element={<Payment />} />
      </Route>

      {/* --- Protected Admin Routes --- */}
      <Route path="/admin" element={
        <AdminErrorBoundary>
          <AdminRoute />
        </AdminErrorBoundary>
      }>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="customers" element={<Customers />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="roadmap" element={<AdminRoadmap />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [hasConfig, setHasConfig] = useState(true);

  /*
     We rely on the Preloader's onFinish callback (approx 4s)
     to switch to the main app content.
  */

  const [showSplash, setShowSplash] = useState(!sessionStorage.getItem('hasSeenSplash'));

  // Check Firebase configuration
  useEffect(() => {
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ];
    const isConfigured = requiredVars.every(
      varName => import.meta.env[varName] && 
        !import.meta.env[varName].includes('your_') && 
        import.meta.env[varName] !== 'your_api_key_here'
    );
    setHasConfig(isConfigured);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  // Show configuration warning if Firebase is not set up
  if (!hasConfig && !loading) {
    return <MissingConfigWarning />;
  }

  if (loading) return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Preloader onFinish={() => setLoading(false)} />
    </>
  );

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <AuthProvider>
        <CartProvider>
          <ShopProvider>
            <WishlistProvider>
              <LoyaltyProvider>
                <NotificationProvider>
                  <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    <Suspense fallback={
                      <div className="min-h-[60vh] flex items-center justify-center">
                        <Loader2 className="animate-spin text-orange-500" size={40} />
                      </div>
                    }>
                      <AppRoutes />
                    </Suspense>
                  </div>
                </NotificationProvider>
              </LoyaltyProvider>
            </WishlistProvider>
          </ShopProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;
