
import React, { useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import { checkAuthSession } from './integrations/supabase/client';
import AdminLayout from './components/layout/AdminLayout';
import ExerciseManagement from './pages/admin/ExerciseManagement';
import ExerciseLibrary from './pages/admin/ExerciseLibrary';
import Profile from './pages/Profile';
import UserLayout from './components/layout/UserLayout';
import ProtectedRoute from './components/ProtectedRoute';
import WorkoutManagement from './pages/admin/WorkoutManagement';
import ProductManagement from './pages/admin/ProductManagement';

const App = () => {
  const { user, session, loading: isLoading } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.user_metadata?.is_admin || false;

  useEffect(() => {
    const checkSession = async () => {
      await checkAuthSession();
    };

    checkSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/exercises" replace />} />
        <Route path="exercises" element={<ExerciseManagement />} />
        <Route path="exercise-library" element={<ExerciseLibrary />} />
        <Route path="workouts" element={<WorkoutManagement />} />
        <Route path="products" element={<ProductManagement />} />
      </Route>

      {/* User routes with UserLayout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        {/* Add user-specific routes here */}
      </Route>
    </Routes>
  );
}

export default App;
