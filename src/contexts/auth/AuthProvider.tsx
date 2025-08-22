
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { AuthContext } from './AuthContext';
import { checkAdminStatus, ensureProfileExists, fetchUserProfile } from './profileUtils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("AuthProvider initializing");

  // Monitor and update admin status
  const updateAdminStatus = useCallback(async (userId: string) => {
    const adminStatus = await checkAdminStatus(userId);
    setIsAdmin(adminStatus);
    return adminStatus;
  }, []);

  // Function to refresh profile data in cache
  const refreshUserProfile = useCallback(() => {
    if (window.queryClient) {
      console.log("Invalidating all profile queries to force refresh");
      window.queryClient.invalidateQueries({ queryKey: ['profile'] });
      window.queryClient.invalidateQueries({ queryKey: ['pixKey'] });
      
      // Force refetch profile data immediately
      if (user?.id) {
        fetchUserProfile(user.id).then(profileData => {
          if (profileData) {
            window.queryClient.setQueryData(['profile', user.id], profileData);
          }
        });
      }
    }
  }, [user?.id]);

  useEffect(() => {
    console.log("AuthProvider useEffect running");
    let mounted = true;

    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
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
          setTimeout(async () => {
            if (mounted) {
              await updateAdminStatus(currentSession.user.id);
              
              // Ensure profile exists for this user
              const metadata = currentSession.user.user_metadata;
              const profileCreated = await ensureProfileExists(currentSession.user.id, metadata);
              
              // Always force refresh profile data on auth state change
              refreshUserProfile();
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
          await updateAdminStatus(currentSession.user.id);
          
          // Ensure profile exists for this user during initial session check
          const metadata = currentSession.user.user_metadata;
          await ensureProfileExists(currentSession.user.id, metadata);
          
          // Force refresh profile data on initial session
          refreshUserProfile();
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
  }, [updateAdminStatus, refreshUserProfile]);

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      console.log("Attempting to sign up with:", email, "and metadata:", metadata);
      
      // Ensure instance_id is included in metadata
      const metadataWithInstanceId = {
        ...metadata,
        instance_id: crypto.randomUUID(),
      };
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadataWithInstanceId,
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
        
        // Create profile for the new user immediately after signup
        await ensureProfileExists(data.user.id, metadataWithInstanceId);
      } else {
        toast.info('Conta criada! Por favor, faça o login.');
      }

      // Return successful registration data
      return data;
    } catch (error: any) {
      console.error("Exception during signup:", error);
      toast.error(error.message || 'Ocorreu um erro durante o cadastro');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error details:", {
          message: error.message,
          status: error.status,
          code: error.code
        });
        throw error;
      }
      
      console.log("Login successful:", { 
        user: data.user?.email,
        hasSession: !!data.session,
        userData: data.user?.user_metadata
      });
      
      // Ensure profile exists for this user after successful login
      if (data.user) {
        // If user is missing instance_id, add it now
        if (!data.user.user_metadata?.instance_id) {
          console.log("User missing instance_id, updating user metadata...");
          
          const updatedMetadata = {
            ...data.user.user_metadata,
            instance_id: crypto.randomUUID(),
          };
          
          // Update user metadata
          const { error: updateError } = await supabase.auth.updateUser({
            data: updatedMetadata
          });
          
          if (updateError) {
            console.error("Error updating user instance_id:", updateError);
          } else {
            console.log("User instance_id added successfully");
          }
        }
        
        await ensureProfileExists(data.user.id, data.user.user_metadata);
      }
      
      return data;
    } catch (error: any) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const adminLogin = async (password: string) => {
    try {
      // If no user is logged in, show an error
      if (!user) {
        throw new Error('You must be logged in to become an admin');
      }

      console.log("Attempting admin login for user:", user.id);
      
      // Call the secure admin login function
      const { data, error } = await supabase.rpc('admin_login', {
        admin_password: password
      });

      if (error) {
        console.error("Admin login error:", error);
        throw new Error('Database error during admin login');
      }

      // Type the response data from the RPC function
      const response = data as { success: boolean; message: string } | null;

      if (!response?.success) {
        throw new Error(response?.message || 'Invalid admin password');
      }

      // Update admin status and refresh profile
      await updateAdminStatus(user.id);
      refreshUserProfile();
      
      toast.success('Admin access granted!');
      navigate('/admin');
    } catch (error: any) {
      console.error("Admin login failed:", error);
      toast.error(error.message || 'Error granting admin access');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out user");
      
      // Save profile data to make sure we don't lose it
      try {
        if (user && window.queryClient) {
          const profileData = window.queryClient.getQueryData(['profile', user.id]);
          if (profileData) {
            console.log("Saving profile data before logout:", profileData);
            // Update only existing profile fields
            const { first_name, last_name } = profileData as any;
            if (first_name || last_name) {
              await supabase
                .from('profiles')
                .update({ 
                  first_name,
                  last_name,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
              console.log("Profile permanently saved to database before logout");
            }
          }
        }
      } catch (error) {
        console.error("Error handling profile data before logout:", error);
      }
      
      // Clear local auth state first for immediate UI feedback
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Clear profile data from cache before signing out
      if (window.queryClient) {
        window.queryClient.removeQueries({ queryKey: ['profile'] });
        window.queryClient.removeQueries({ queryKey: ['pixKey'] });
      }
      
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
