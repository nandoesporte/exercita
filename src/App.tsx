
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth";

// Import layouts
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// User pages
import Index from "@/pages/Index";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Store from "@/pages/Store";
import ProductDetail from "@/pages/ProductDetail";
import Schedule from "@/pages/Schedule";
import GymPhotos from "@/components/GymPhotos";
import Appointments from "@/pages/Appointments";

// Profile related pages
import AccountInfo from "@/pages/AccountInfo";
import Settings from "@/pages/Settings";
import WorkoutHistory from "@/pages/WorkoutHistory";
import Reminders from "@/pages/Reminders";
import Notifications from "@/pages/Notifications";
import PaymentMethods from "@/pages/PaymentMethods";
import InviteFriends from "@/pages/InviteFriends";
import HelpCenter from "@/pages/HelpCenter";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import WorkoutManagement from "@/pages/admin/WorkoutManagement";
import CreateWorkout from "@/pages/admin/CreateWorkout";
import EditWorkout from "@/pages/admin/EditWorkout";
import EditWorkoutExercises from "@/pages/admin/EditWorkoutExercises";
import ExerciseManagement from "@/pages/admin/ExerciseManagement";
import ProductManagement from "@/pages/admin/ProductManagement";
import CategoryManagement from "@/pages/admin/CategoryManagement";
import CreateProduct from "@/pages/admin/CreateProduct";
import EditProduct from "@/pages/admin/EditProduct";
import ScheduleManagement from "@/pages/admin/ScheduleManagement";
import PaymentMethodManagement from "@/pages/admin/PaymentMethodManagement";
import ExerciseLibrary from "@/pages/admin/ExerciseLibrary";
import GymPhotoManagement from "@/pages/admin/GymPhotoManagement"; 
import UserManagement from "@/pages/admin/UserManagement";
import AppointmentManagement from "@/pages/admin/AppointmentManagement";
import RLSChecker from './pages/admin/RLSChecker';

const App = () => {
  console.log("App component rendering");
  const { user, loading } = useAuth();
  
  // Show loading state if auth context is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
      </div>
    );
  }
  
  return (
    <>
      <Routes>
        {/* Public Routes */}
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
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/:id" element={<ProductDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/gym-photos" element={<GymPhotos />} />
          <Route path="/appointments" element={<Appointments />} />
          
          {/* Profile related pages */}
          <Route path="/account" element={<AccountInfo />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/workout-history" element={<WorkoutHistory />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/payment" element={<PaymentMethods />} />
          <Route path="/invite" element={<InviteFriends />} />
          <Route path="/help" element={<HelpCenter />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute isAdminRoute={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          {/* Workouts */}
          <Route path="workouts" element={<WorkoutManagement />} />
          <Route path="workouts/create" element={<CreateWorkout />} />
          <Route path="workouts/:id/edit" element={<EditWorkout />} />
          <Route path="workouts/:id/exercises" element={<EditWorkoutExercises />} />
          {/* Exercises */}
          <Route path="exercises" element={<ExerciseManagement />} />
          <Route path="exercises/library" element={<ExerciseLibrary />} />
          {/* Products */}
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          {/* Categories */}
          <Route path="categories" element={<CategoryManagement />} />
          {/* Photos */}
          <Route path="photos" element={<GymPhotoManagement />} />
          {/* Scheduling */}
          <Route path="schedule" element={<ScheduleManagement />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          {/* Payment */}
          <Route path="payment-methods" element={<PaymentMethodManagement />} />
          {/* Users */}
          <Route path="users" element={<UserManagement />} />
          {/* RLS Checker */}
          <Route path="rls-checker" element={<RLSChecker />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
