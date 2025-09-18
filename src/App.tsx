import { Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/auth';
import { AdminPermissionsProvider } from '@/contexts/admin/AdminPermissionsContext';
import { Toaster } from '@/components/ui/sonner';
import { ReactQueryProvider } from '@/lib/react-query';
import ProtectedRoute from "@/components/ProtectedRoute";

// Import layouts
import UserLayout from "@/components/layout/UserLayout";

// Core physiotherapy pages
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Symptoms from "@/pages/Symptoms";
import Progress from "@/pages/Progress";
import Education from "@/pages/Education";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import Appointments from "@/pages/Appointments";

const App = () => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <AdminPermissionsProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected User Routes - Physiotherapy Focus */}
            <Route element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/symptoms" element={<Symptoms />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/education" element={<Education />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workout/:id" element={<WorkoutDetail />} />
              <Route path="/appointments" element={<Appointments />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AdminPermissionsProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
};

export default App;