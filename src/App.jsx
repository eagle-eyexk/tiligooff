import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/lib/cartStore.jsx';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import Home from '@/pages/Home';
import BusinessPage from '@/pages/BusinessPage';
import Cart from '@/pages/Cart';
import Orders from '@/pages/Orders';
import OrderTracking from '@/pages/OrderTracking';
import Profile from '@/pages/Profile';
import BusinessDashboard from '@/pages/BusinessDashboard';
import CourierDashboard from '@/pages/CourierDashboard';
import Invoice from '@/pages/Invoice';
import Admin from '@/pages/Admin';
import GitPanel from '@/pages/GitPanel';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="https://media.base44.com/images/public/user_69e68678ce0d9fdef245009b/8f0358955_IMG_0105.jpeg" alt="TiliGo" className="w-16 h-16 rounded-2xl object-cover animate-pulse" />
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/" element={<Home />} />
          <Route path="/business/:id" element={<BusinessPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
          <Route path="/courier-dashboard" element={<CourierDashboard />} />
          <Route path="/invoice/:id" element={<Invoice />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
        <Route path="/git" element={<GitPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App