
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useEffect, useState } from 'react';
import { checkAuthSession } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  isAdminRoute?: boolean;
}

const ProtectedRoute = ({ children, roles, isAdminRoute = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  
  // Debug auth state on protected routes
  useEffect(() => {
    // Debug current auth state
    console.log("ProtectedRoute auth status:", { 
      path: location.pathname,
      user: !!user, 
      userId: user?.id,
      isAdmin, 
      adminOnly: isAdminRoute,
      rolesRequired: roles,
      loading
    });
    
    // Only verify session if no user is found and we're not already checking
    if (!loading && !user && !isCheckingSession) {
      setIsCheckingSession(true);
      
      checkAuthSession().then(session => {
        if (session) {
          console.log("Session found in direct check but not in context", session);
          // Force page reload to re-initialize auth context if there's a mismatch
          window.location.reload();
        } else {
          console.log("No active session found in direct check");
        }
        setIsCheckingSession(false);
      });
    }
  }, [user, loading, isAdmin, isAdminRoute, location.pathname, isCheckingSession, roles]);

  // Show loading state if either the auth context is loading or we're checking the session
  if (loading || isCheckingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For admin routes, check admin status
  if (isAdminRoute && !isAdmin) {
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
  
  // Check for specific roles if provided
  if (roles && roles.length > 0) {
    // If roles are required and the user is not an admin (admins bypass role checks)
    if (!isAdmin && roles.includes('admin')) {
      console.log("Access denied: User does not have required role", {
        userId: user.id,
        requiredRoles: roles
      });
      return <Navigate to="/login?roleAccess=required" replace />;
    }
  }

  // If we reach here, user is authenticated and has proper permissions
  console.log("Access granted to protected route");
  return <>{children}</>;
};

export default ProtectedRoute;
