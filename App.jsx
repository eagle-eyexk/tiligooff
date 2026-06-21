import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import BusinessPage from './src/pages/BusinessPage';
import BusinessDashboard from './src/pages/BusinessDashboard';
import CourierDashboard from './src/pages/CourierDashboard';
import Cart from './src/pages/Cart';
import Orders from './src/pages/Orders';
import OrderTracking from './src/pages/OrderTracking';
import Profile from './src/pages/Profile';
import AdminPanel from './src/pages/AdminPanel';
import Invoice from './src/pages/Invoice';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/courier/dashboard" element={<CourierDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/track/:id" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
