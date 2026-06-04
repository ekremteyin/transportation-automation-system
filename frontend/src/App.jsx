import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import SenderDashboard from './pages/sender/Dashboard';
import AdvertList from './pages/sender/AdvertList';
import AdvertCreate from './pages/sender/AdvertCreate';
import AdvertDetail from './pages/sender/AdvertDetail';
import AdvertEdit from './pages/sender/AdvertEdit';

import CarrierDashboard from './pages/carrier/Dashboard';
import OpenAdverts from './pages/carrier/OpenAdverts';
import MyOffers from './pages/carrier/MyOffers';
import ActiveJobs from './pages/carrier/ActiveJobs';

import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AdvertManagement from './pages/admin/AdvertManagement';
import Complaints from './pages/admin/Complaints';

import MessagesPage from './pages/messages/MessagesPage';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center min-h-screen text-slate-500">
              Bu sayfaya erişim yetkiniz yok.
            </div>
          } />

          {/* Gönderici */}
          <Route path="/sender" element={
            <ProtectedRoute allowedRoles={['Sender']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index                        element={<SenderDashboard />} />
            <Route path="adverts"               element={<AdvertList />} />
            <Route path="adverts/new"           element={<AdvertCreate />} />
            <Route path="adverts/:id"           element={<AdvertDetail />} />
            <Route path="adverts/:id/edit"      element={<AdvertEdit />} />
          </Route>

          {/* Taşıyıcı */}
          <Route path="/carrier" element={
            <ProtectedRoute allowedRoles={['Carrier']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index                   element={<CarrierDashboard />} />
            <Route path="open-adverts"     element={<OpenAdverts />} />
            <Route path="my-offers"        element={<MyOffers />} />
            <Route path="active-jobs"      element={<ActiveJobs />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index                   element={<AdminDashboard />} />
            <Route path="users"            element={<UserManagement />} />
            <Route path="adverts"          element={<AdvertManagement />} />
            <Route path="complaints"       element={<Complaints />} />
          </Route>

          {/* Mesajlaşma (Sender + Carrier) */}
          <Route path="/messages" element={
            <ProtectedRoute allowedRoles={['Sender', 'Carrier']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<MessagesPage />} />
          </Route>

          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
