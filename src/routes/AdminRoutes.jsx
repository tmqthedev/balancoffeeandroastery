import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminRoute from '../components/auth/AdminRoute';
import AdminLayout from '../components/admin/AdminLayout';

// Loading component for admin routes
const AdminLoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    <span className="ml-3 text-gray-600">Đang tải trang quản trị...</span>
  </div>
);

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('../pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'));
const AdminCustomers = React.lazy(() => import('../pages/admin/AdminCustomers'));
const AdminBlogs = React.lazy(() => import('../pages/admin/AdminBlogs'));
const AdminContacts = React.lazy(() => import('../pages/admin/AdminContacts'));
const AdminCMS = React.lazy(() => import('../pages/admin/AdminCMS'));

// CRM Pages
const CRMDashboard = React.lazy(() => import('../pages/admin/CRMDashboard'));
const CRMUserManagement = React.lazy(() => import('../pages/admin/CRMUserManagement'));
const CRMCustomerManagement = React.lazy(() => import('../pages/admin/CRMCustomerManagement'));
const CRMSalesManagement = React.lazy(() => import('../pages/admin/CRMSalesManagement'));
const CRMSystemConfig = React.lazy(() => import('../pages/admin/CRMSystemConfig'));

// Test page
const TestAdminPage = React.lazy(() => import('../pages/admin/TestAdminPage'));

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={
          <AdminRoute>
            <Suspense fallback={<AdminLoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          </AdminRoute>
        } />
      <Route path="/products" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <AdminProducts />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/orders" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <AdminOrders />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/customers" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <AdminCustomers />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/blogs" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <AdminBlogs />
          </Suspense>
        </AdminRoute>
      } />      <Route path="/contacts" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <AdminContacts />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/cms" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <AdminCMS />
          </Suspense>
        </AdminRoute>
      } />
        {/* CRM Routes */}
      <Route path="/test" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <TestAdminPage />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/crm" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <CRMDashboard />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/crm/users" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <CRMUserManagement />
          </Suspense>
        </AdminRoute>
      } />      <Route path="/crm/customers" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <CRMCustomerManagement />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/crm/sales" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <CRMSalesManagement />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/crm/system" element={
        <AdminRoute>
          <Suspense fallback={<AdminLoadingSpinner />}>
            <CRMSystemConfig />
          </Suspense>
        </AdminRoute>      } />
    </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
