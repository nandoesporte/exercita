import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserLayout from '@/components/layout/UserLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import Workouts from '@/pages/Workouts';
import Workout from '@/pages/Workout';
import EditWorkoutExercises from '@/pages/admin/EditWorkoutExercises';
import AdminWorkouts from '@/pages/admin/AdminWorkouts';
import AdminExercises from '@/pages/admin/AdminExercises';
import CreateWorkout from '@/pages/admin/CreateWorkout';
import EditWorkout from '@/pages/admin/EditWorkout';
import CreateExercise from '@/pages/admin/CreateExercise';
import EditExercise from '@/pages/admin/EditExercise';
import AdminUsers from '@/pages/admin/AdminUsers';
import Account from '@/pages/Account';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import FindGym from '@/pages/FindGym';
import { Toaster } from "@/components/ui/toaster"
import { checkAuthSession } from '@/integrations/supabase/client';
import WorkoutHistory from './pages/WorkoutHistory';
import Reminders from './pages/Reminders';
import Notifications from './pages/Notifications';
import Invite from './pages/Invite';
import Help from './pages/Help';
import GymPhotoManagement from './pages/admin/GymPhotoManagement';
import GymPhotos from './pages/GymPhotos';

function App() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Function to determine if running as a standalone PWA
    const isRunningAsPWA = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    };

    setIsPWA(isRunningAsPWA());

    // Optionally, listen for changes in the display mode
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
      setIsPWA(evt.matches);
    });
  }, []);

  const ProtectedRoute = ({ children, isAdmin }: { children: React.ReactNode, isAdmin?: boolean }) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>; // You can replace this with a spinner or loading indicator
    }

    if (!user) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" replace />;
    }

    if (isAdmin) {
      // Check if the user has admin privileges
      const { isAdmin: isAdminUser } = useAuth();
      if (!isAdminUser) {
        // Redirect to unauthorized page or home page if not an admin
        return <Navigate to="/" replace />;
      }
    }

    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/workout/:id" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
          <Route path="/workout-history" element={<ProtectedRoute><WorkoutHistory /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
          <Route path="/find-gym" element={<ProtectedRoute><FindGym /></ProtectedRoute>} />
          
          {/* Add the gym photos route */}
          <Route path="/gym-photos" element={<GymPhotos />} />
          
          {/* Add the gym photos route */}
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute isAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Admin />} />
          <Route path="workouts" element={<AdminWorkouts />} />
          <Route path="workouts/create" element={<CreateWorkout />} />
          <Route path="workouts/edit/:id" element={<EditWorkout />} />
          <Route path="workouts/exercises/:id" element={<EditWorkoutExercises />} />
          <Route path="exercises" element={<AdminExercises />} />
          <Route path="exercises/create" element={<CreateExercise />} />
          <Route path="exercises/edit/:id" element={<EditExercise />} />
          <Route path="users" element={<AdminUsers />} />
          
          {/* Add gym photo management route */}
          <Route path="gym-photos" element={<GymPhotoManagement />} />
          
          {/* Add gym photo management route */}
        </Route>
      </Routes>
      <Toaster />
      {isPWA && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white text-center p-2">
          You're running the PWA version of this app!
        </div>
      )}
    </Router>
  );
}

export default App;
