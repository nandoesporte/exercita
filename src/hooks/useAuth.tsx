
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  adminLogin: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("AuthProvider initializing");

  useEffect(() => {
    console.log("AuthProvider useEffect running");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change detected", { event, user: currentSession?.user?.email });
        
        // First update session and user state synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Then defer checking admin status to avoid deadlocks
        if (currentSession?.user) {
          console.log("Auth state change detected, checking admin status");
          setTimeout(() => {
            checkAdminStatus(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    const initSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check result:", { 
          hasSession: !!currentSession,
          email: currentSession?.user?.email
        });
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("Initial session found, checking admin status");
          await checkAdminStatus(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
        console.log("AuthProvider loading complete");
      }
    };

    initSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log(`Checking admin status for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      console.log("Admin status check result:", data);
      const adminStatus = data?.is_admin || false;
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        console.log("User has admin privileges!");
      } else {
        console.log("User does not have admin privileges");
      }
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      toast.success('Account created! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate('/');
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid login credentials');
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
        const { error } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error setting admin status:", error);
          throw error;
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
      // Clear local auth state first
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      console.log("Sign out successful, redirecting to login page");
      navigate('/login');
      toast.success('Logout realizado com sucesso');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || 'Erro ao fazer logout');
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
