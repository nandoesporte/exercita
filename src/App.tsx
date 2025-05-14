
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import { checkAuthSession } from './integrations/supabase/client';
import AdminLayout from './components/layout/AdminLayout';
import ExerciseManagement from './pages/admin/ExerciseManagement';
import ExerciseLibrary from './pages/admin/ExerciseLibrary';
import Profile from './pages/Profile';

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

  const router = createBrowserRouter([
    {
      path: "/",
      element: <div>Home Page</div>,
    },
    {
      path: "/profile",
      element: <Profile />
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
          path: "exercise-library",
          element: <ExerciseLibrary />
        }
      ]
    }
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <RouterProvider router={router} />
  );
}

export default App;
