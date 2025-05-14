import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import AuthenticationLayout from './components/layout/AuthenticationLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MainLayout from './components/layout/MainLayout';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import Profile from './pages/Profile';
import AdminLayout from './components/layout/AdminLayout';
import ExerciseManagement from './pages/admin/ExerciseManagement';
import { checkAuthSession } from './integrations/supabase/client';
import PersonalTrainers from './pages/admin/PersonalTrainers';
import PaymentSettings from './pages/admin/PaymentSettings';
import ExerciseLibrary from './pages/admin/ExerciseLibrary';

const App = () => {
  const { isLoggedIn, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      await checkAuthSession();
    };

    checkSession();
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: !isLoggedIn ? <Navigate to="/auth/login" replace={true} /> : <MainLayout />,
      children: [
        {
          path: "",
          element: <Home />
        },
        {
          path: "/workouts",
          element: <Workouts />
        },
        {
          path: "/workout/:id",
          element: <WorkoutDetail />
        },
        {
          path: "/profile",
          element: <Profile />
        }
      ]
    },
    {
      path: "/auth",
      element: isLoggedIn ? <Navigate to="/" replace={true} /> : <AuthenticationLayout />,
      children: [
        {
          path: "login",
          element: <Login />
        },
        {
          path: "register",
          element: <Register />
        }
      ]
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "",
          element: <Navigate to="/admin/exercises" replace={true} />
        },
        {
          path: "exercises",
          element: <ExerciseManagement />
        },
        {
          path: "personal-trainers",
          element: <PersonalTrainers />
        },
        {
          path: "payment-settings",
          element: <PaymentSettings />
        }
      ]
    },
    {
      path: "/admin/exercise-library",
      element: <AdminLayout />,
      children: [
        {
          path: "",
          element: <ExerciseLibrary />
        }
      ]
    },
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <RouterProvider router={router} />
  );
}

export default App;
