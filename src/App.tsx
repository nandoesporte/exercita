
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import layouts
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// User pages
import Index from "@/pages/Index";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import WorkoutManagement from "@/pages/admin/WorkoutManagement";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* User Routes */}
          <Route element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Index />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="workouts" element={<WorkoutManagement />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
