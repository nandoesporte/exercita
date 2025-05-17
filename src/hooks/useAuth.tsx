
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // Check admin status safely with timeout to avoid deadlocks
  const checkAdminStatus = useCallback(async (userId: string) => {
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
        return false;
      }
      
      console.log("Admin status check result:", data);
      const adminStatus = data?.is_admin || false;
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        console.log("User has admin privileges!");
      } else {
        console.log("User does not have admin privileges");
      }
      
      return adminStatus;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log("AuthProvider useEffect running");
    let mounted = true;
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change detected", { 
          event, 
          user: currentSession?.user?.email,
          accessToken: currentSession?.access_token?.substring(0, 10) + '...'
        });
        
        if (!mounted) return;
        
        // Update session and user state synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Then defer checking admin status to avoid deadlocks
        if (currentSession?.user) {
          setTimeout(() => {
            if (mounted) {
              checkAdminStatus(currentSession.user.id);
            }
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
        
        if (!mounted) return;
        
        console.log("Initial session check result:", { 
          hasSession: !!currentSession,
          email: currentSession?.user?.email,
          accessToken: currentSession?.access_token?.substring(0, 10) + '...'
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
        if (mounted) {
          setLoading(false);
          console.log("AuthProvider loading complete");
        }
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      console.log("Attempting to sign up with:", email, "and metadata:", metadata);
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        console.error("SignUp error:", error);
        throw error;
      }
      
      console.log("SignUp result:", data);
      
      if (data?.user) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      } else {
        toast.info('Conta criada! Por favor, faça o login.');
      }
    } catch (error: any) {
      console.error("Exception during signup:", error);
      toast.error(error.message || 'Ocorreu um erro durante o cadastro');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando fazer login com:", email);
      
      // Log mais detalhado sobre a tentativa de login
      console.log("Detalhes da tentativa de login:", { 
        email, 
        passwordLength: password.length,
        timestamp: new Date().toISOString()
      });
      
      // Usar uma única tentativa de login com melhor tratamento de erros
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Detalhes do erro de login:", {
          message: error.message,
          status: error.status,
          name: error.name,
          code: error.code
        });
        
        // Verificar se o erro é devido a credenciais inválidas
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciais inválidas. Por favor, verifique seu email e senha.');
        }
        
        throw error;
      }
      
      console.log("Login bem-sucedido:", { 
        user: data.user?.email,
        hasSession: !!data.session,
        sessionExpires: data.session?.expires_at,
        userData: data.user?.user_metadata
      });
      
      // Navegar para a página inicial após sucesso no login
      navigate('/');
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error("Erro no processo de login:", error);
      toast.error(error.message || 'Erro ao fazer login. Tente novamente.');
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
      
      // Clear local auth state first for immediate UI feedback
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Try to sign out from Supabase, but don't block the UI flow if it fails
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          console.log("Active session found, signing out from Supabase");
          await supabase.auth.signOut({ scope: 'global' });
        } else {
          console.log("No active session found in Supabase");
        }
      } catch (error: any) {
        // Log the error but don't block user experience
        console.error("Error during Supabase sign out:", error);
      }
      
      // Always navigate to login regardless of Supabase outcome
      console.log("Redirecting to login page");
      navigate('/login');
      toast.success('Logout realizado com sucesso');
    } catch (error: any) {
      // This catch is mainly for navigation errors
      console.error("Final signOut error:", error);
      // Still try to navigate to login as a fallback
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
