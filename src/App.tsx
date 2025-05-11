
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Public Pages
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin Pages (requires admin authentication)
import AdminLayout from './components/layout/AdminLayout';
import WorkoutManagement from './pages/admin/WorkoutManagement';
import CreateWorkout from './pages/admin/CreateWorkout';
import EditWorkout from './pages/admin/EditWorkout';
import EditWorkoutExercises from './pages/admin/EditWorkoutExercises';
import ExerciseManagement from './pages/admin/ExerciseManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes (requires admin authentication) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/workouts" replace />} />
              <Route path="workouts" element={<WorkoutManagement />} />
              <Route path="workouts/new" element={<CreateWorkout />} />
              <Route path="workouts/:id/edit" element={<EditWorkout />} />
              <Route path="workouts/:id/exercises" element={<EditWorkoutExercises />} />
              <Route path="exercises" element={<ExerciseManagement />} />
            </Route>

            {/* Redirect root to admin workouts */}
            <Route path="/" element={<Navigate to="/admin/workouts" replace />} />

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
