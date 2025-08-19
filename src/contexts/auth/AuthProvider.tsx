import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/database';
import { login, register, validateToken, logout } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await login(email, password);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        return { success: true };
      } else {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Authentication failed');
      return { success: false, error: 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await register({ email, password, firstName: firstName || '', lastName: lastName || '' });
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed');
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        const user = await validateToken(storedToken);
        if (user) {
          setUser(user);
          setToken(storedToken);
        }
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      error,
      login: loginUser,
      register: registerUser,
      logout: logoutUser
    }}>
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