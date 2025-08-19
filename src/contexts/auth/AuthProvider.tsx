import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User, Session } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  console.log("AuthProvider initializing");

  // Initialize auth state
  useEffect(() => {
    console.log("AuthProvider useEffect running");
    
    const initializeAuth = () => {
      const currentSession = authService.getSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAdmin(currentSession.user.is_admin || false);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      console.log("Attempting to sign up with:", email, "and metadata:", metadata);
      
      const response = await authService.signUp(email, password, metadata);
      
      if (response.error) {
        console.error("SignUp error:", response.error);
        throw new Error(response.error);
      }
      
      console.log("SignUp result:", response);
      
      if (response.user && response.session) {
        setUser(response.user);
        setSession(response.session);
        setIsAdmin(response.user.is_admin || false);
        toast.success('Conta criada com sucesso!');
      }

      return response;
    } catch (error: any) {
      console.error("Exception during signup:", error);
      toast.error(error.message || 'Ocorreu um erro durante o cadastro');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      
      const response = await authService.signIn(email, password);
      
      if (response.error) {
        console.error("Login error details:", response.error);
        throw new Error(response.error);
      }
      
      console.log("Login successful:", { 
        user: response.user?.email,
        hasSession: !!response.session
      });
      
      if (response.user && response.session) {
        setUser(response.user);
        setSession(response.session);
        setIsAdmin(response.user.is_admin || false);
      }
      
      return response;
    } catch (error: any) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const adminLogin = async (password: string) => {
    try {
      // Check if the password matches the admin password
      if (password !== 'Nando045+-') {
        throw new Error('Invalid admin password');
      }

      // If there is a logged-in user, make them an admin
      if (user) {
        console.log("Setting admin status for user:", user.id);
        const success = await authService.setAdminStatus(user.id, true);
        
        if (!success) {
          throw new Error('Failed to set admin status');
        }
        
        setIsAdmin(true);
        toast.success('Admin access granted!');
        navigate('/admin');
        return;
      }
      
      // If no user is logged in, show an error
      throw new Error('You must be logged in to become an admin');
    } catch (error: any) {
      toast.error(error.message || 'Error granting admin access');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out user");
      
      // Clear local auth state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Sign out from auth service
      authService.signOut();
      
      // Clear query cache if available
      if (window.queryClient) {
        window.queryClient.clear();
      }
      
      console.log("Redirecting to login page");
      navigate('/login');
      toast.success('Logout realizado com sucesso');
    } catch (error: any) {
      console.error("Final signOut error:", error);
      navigate('/login');
    }
  };

  console.log("AuthProvider rendering with state:", { 
    hasUser: !!user,
    isAdmin,
    loading,
    email: user?.email
  });

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, adminLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}