
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { checkAuthSession } from './integrations/supabase/client';

// Public Pages
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import ProductDetail from './pages/ProductDetail';
import Schedule from './pages/Schedule';
import Store from './pages/Store';
import Payment from './pages/Payment';
import PaymentMethods from './pages/PaymentMethods';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import WorkoutManagement from './pages/admin/WorkoutManagement';
import CreateWorkout from './pages/admin/CreateWorkout';
import EditWorkout from './pages/admin/EditWorkout';
import EditWorkoutExercises from './pages/admin/EditWorkoutExercises';
import ExerciseManagement from './pages/admin/ExerciseManagement';
import ProductManagement from './pages/admin/ProductManagement';
import CreateProduct from './pages/admin/CreateProduct';
import EditProduct from './pages/admin/EditProduct';
import PaymentMethodManagement from './pages/admin/PaymentMethodManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import ExerciseLibrary from './pages/admin/ExerciseLibrary';

function App() {
  const { user, loading, session } = useAuth();
  
  useEffect(() => {
    // Debugging: Check session status periodically
    const intervalId = setInterval(async () => {
      await checkAuthSession();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  // Determine if user is logged in
  const isLoggedIn = !!user;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Store />} /> {/* Use Store as default landing page */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/store" element={<Store />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<WorkoutManagement />} />
          <Route path="workouts/create" element={<CreateWorkout />} />
          <Route path="workouts/:id/edit" element={<EditWorkout />} />
          <Route path="workouts/:id/exercises" element={<EditWorkoutExercises />} />
          <Route path="exercises" element={<ExerciseManagement />} />
          <Route path="library" element={<ExerciseLibrary />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="payments" element={<PaymentMethodManagement />} />
          <Route path="schedule" element={<ScheduleManagement />} />
          {/* Add more admin routes here */}
        </Route>

        {/* Redirect to Home if route is not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
