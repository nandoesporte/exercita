
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <>
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
      <Toaster />
    </>
  );
}

export default App;
