import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Auth pages
import SellerRegister from './pages/SellerRegister';
import SellerLogin from './pages/SellerLogin';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

// DLP auth pages
import DlpRegister from './pages/DlpRegister';
import DlpLogin from './pages/DlpLogin';

// Public order form
import OrderForm from './pages/OrderForm';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import SellerApprovals from './pages/admin/SellerApprovals';
import DlpApprovals from './pages/admin/DlpApprovals';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerOrders from './pages/seller/Orders';
import SellerReports from './pages/seller/Reports';
import SellerShareLink from './pages/seller/ShareLink';

// DLP pages
import DlpDashboard from './pages/dlp/Dashboard';
import DlpOrders from './pages/dlp/Orders';

// Protection
import ProtectedRoute from './components/ProtectedRoute';

import RootRedirect from './components/RootRedirect';

import ScanDispatch from './pages/dlp/ScanDispatch';
import InboundScan from './pages/dlp/InboundScan';
import SortScan from './pages/dlp/SortScan';

// Finance page for admins
import FinanceDashboard from './pages/admin/FinanceDashboard';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Root redirect */}
        {/* <Route path="/" element={<Navigate to="/admin/login" replace />} /> */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public */}
        <Route path="/order-form/:sellerId" element={<OrderForm />} />

        {/* Auth */}
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* DLP auth */}
        <Route path="/dlp/register" element={<DlpRegister />} />
        <Route path="/dlp/login" element={<DlpLogin />} />

        {/* Admin protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute role="admin">
              <SellerApprovals />
            </ProtectedRoute>
          }
        />

        {/* DLP approvals page */}
        <Route
          path="/admin/dlps"
          element={
            <ProtectedRoute role="admin">
              <DlpApprovals />
            </ProtectedRoute>
          }
        />

        {/* Optional placeholders for now */}
        <Route
          path="/admin/sellers"
          element={<Navigate to="/admin/approvals" replace />}
        />
        <Route
          path="/admin/reports"
          element={<Navigate to="/admin/orders" replace />}
        />
        <Route
          path="/admin/audit-logs"
          element={<Navigate to="/admin/orders" replace />}
        />

        {/* Finance dashboard for admin */}
        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute role="admin">
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* Seller protected */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute role="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute role="seller">
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/share-link"
          element={
            <ProtectedRoute role="seller">
              <SellerShareLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/reports"
          element={
            <ProtectedRoute role="seller">
              <SellerReports />
            </ProtectedRoute>
          }
        />

        {/* DLP protected */}
        <Route
          path="/dlp/dashboard"
          element={
            <ProtectedRoute role="dlp">
              <DlpDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dlp/orders"
          element={
            <ProtectedRoute role="dlp">
              <DlpOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dlp/scan-dispatch"
          element={
            <ProtectedRoute role="dlp">
              <ScanDispatch />
            </ProtectedRoute>
          }
        />

        {/* DLP scan inbound */}
        <Route
          path="/dlp/scan-inbound"
          element={
            <ProtectedRoute role="dlp">
              <InboundScan />
            </ProtectedRoute>
          }
        />

        {/* DLP scan sorting */}
        <Route
          path="/dlp/scan-sort"
          element={
            <ProtectedRoute role="dlp">
              <SortScan />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;