import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { checkAuthSession } from './integrations/supabase/client';

// Public Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import PersonalTrainers from './pages/PersonalTrainers';
import TrainerDetail from './pages/TrainerDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import Schedule from './pages/Schedule';

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
  const { isLoggedIn, isLoading, refreshAuthStatus } = useAuth();

  useEffect(() => {
    // Refresh auth status on app load
    refreshAuthStatus();

    // Debugging: Check session status periodically
    const intervalId = setInterval(async () => {
      await checkAuthSession();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(intervalId);
  }, [refreshAuthStatus]);
  
  if (isLoading) {
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
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/trainers" element={<PersonalTrainers />} />
        <Route path="/trainers/:id" element={<TrainerDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<PostDetail />} />
        <Route path="/schedule" element={<Schedule />} />

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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
