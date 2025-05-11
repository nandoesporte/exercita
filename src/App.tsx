import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Public Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// App Pages (requires authentication)
import Dashboard from './pages/app/Dashboard';
import Workouts from './pages/app/Workouts';
import WorkoutDetail from './pages/app/WorkoutDetail';
import UserProfile from './pages/app/UserProfile';

// Admin Pages (requires admin authentication)
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkoutManagement from './pages/admin/WorkoutManagement';
import CreateWorkout from './pages/admin/CreateWorkout';
import EditWorkout from './pages/admin/EditWorkout';
import EditWorkoutExercises from './pages/admin/EditWorkoutExercises';
import ExerciseManagement from './pages/admin/ExerciseManagement';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* App Routes (requires authentication) */}
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/workouts" element={<Workouts />} />
            <Route path="/app/workouts/:id" element={<WorkoutDetail />} />
            <Route path="/app/profile" element={<UserProfile />} />

            {/* Admin Routes (requires admin authentication) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="workouts" element={<WorkoutManagement />} />
              <Route path="workouts/new" element={<CreateWorkout />} />
              <Route path="workouts/:id/edit" element={<EditWorkout />} />
              <Route path="workouts/:id/exercises" element={<EditWorkoutExercises />} />
              <Route path="exercises" element={<ExerciseManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
            </Route>

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
