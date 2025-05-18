import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import AccountInfo from './pages/AccountInfo';
import GymPhotos from './components/GymPhotos';
import History from './pages/History';
import NotFound from './pages/NotFound';
import Schedule from './pages/Schedule';
import Store from './pages/Store';
import PaymentMethods from './pages/PaymentMethods';
import HealthStats from './pages/HealthStats';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import Reminders from './pages/Reminders';
import HelpCenter from './pages/HelpCenter';
import InviteFriends from './pages/InviteFriends';
import WorkoutDetail from './pages/WorkoutDetail';
import Settings from './pages/Settings';
import ProductDetail from './pages/ProductDetail';
import WorkoutHistory from './pages/WorkoutHistory';
import { useIsMobile } from './hooks/use-mobile';
import { usePWAInstallPrompt } from './hooks/usePWAInstallPrompt';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  const isMobile = useIsMobile();
  const { showPrompt, handleClosePrompt } = usePWAInstallPrompt();
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* User routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }>
          {/* User layout children */}
          <Route index element={<Index />} />
          <Route path="profile" element={<Profile />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="workout/:id" element={<WorkoutDetail />} />
          <Route path="history" element={<History />} />
          <Route path="workout-history/:id" element={<WorkoutHistory />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="store" element={<Store />} />
          <Route path="store/:id" element={<ProductDetail />} />
          <Route path="account-info" element={<AccountInfo />} />
          <Route path="gym-photos" element={<GymPhotos />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="health-stats" element={<HealthStats />} />
          <Route path="payment" element={<Payment />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="help-center" element={<HelpCenter />} />
          <Route path="invite-friends" element={<InviteFriends />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* Admin layout children */}
          <Route index element={<Navigate to="/admin/users" />} />
        </Route>
        
        {/* Fallback routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
      
      {/* PWA Install Prompt - only shown on mobile when conditions are met */}
      {isMobile && showPrompt && (
        <PWAInstallPrompt onClose={handleClosePrompt} />
      )}
    </>
  );
}

export default App;
