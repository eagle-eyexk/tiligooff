import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import BusinessPage from './src/pages/BusinessPage';
import Checkout from './src/pages/Checkout';
import MyOrders from './src/pages/MyOrders';
import TrackOrder from './src/pages/TrackOrder';
import UserLogin from './src/pages/UserLogin';
import UserRegister from './src/pages/UserRegister';
import BusinessLogin from './src/pages/BusinessLogin';
import BusinessRegister from './src/pages/BusinessRegister';
import BusinessDashboard from './src/pages/BusinessDashboard';
import DeliveryLogin from './src/pages/DeliveryLogin';
import DeliveryRegister from './src/pages/DeliveryRegister';
import DeliveryDashboard from './src/pages/DeliveryDashboard';
import AdminPanel from './src/pages/AdminPanel';
import StaffHub from './src/pages/StaffHub';
import Administrator from './src/pages/Administrator';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/business/login" element={<BusinessLogin />} />
        <Route path="/business/register" element={<BusinessRegister />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route path="/delivery/register" element={<DeliveryRegister />} />
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/staff" element={<StaffHub />} />
        <Route path="/administrator" element={<Administrator />} />
      </Routes>
    </BrowserRouter>
  );
}