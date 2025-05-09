
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For admin routes, check admin status
  if (adminOnly && !isAdmin) {
    // Add console.log for debugging
    console.log("Access denied: User is not an admin", { user, isAdmin });
    return <Navigate to="/" replace />;
  }

  // If we reach here, user is authenticated and has proper permissions
  return <>{children}</>;
};

export default ProtectedRoute;
