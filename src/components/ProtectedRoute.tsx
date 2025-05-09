
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", { 
    path: location.pathname,
    user: !!user, 
    isAdmin, 
    adminOnly,
    loading
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // For admin routes, check admin status
  if (adminOnly && !isAdmin) {
    // Add more descriptive console.log for debugging
    console.log("Access denied: User is not an admin", { 
      userId: user.id, 
      isAdmin, 
      email: user.email,
      metadata: user.user_metadata 
    });
    
    // Redirect to admin login instead of homepage
    return <Navigate to="/login?adminAccess=required" replace />;
  }

  // If we reach here, user is authenticated and has proper permissions
  console.log("Access granted to protected route");
  return <>{children}</>;
};

export default ProtectedRoute;
