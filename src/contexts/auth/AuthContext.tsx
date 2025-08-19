
import { createContext } from 'react';
import { User } from '@/lib/auth';

export type AuthContextType = {
  user: User | null;
  session: { access_token: string; user: User; expires_at: number } | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  adminLogin: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with undefined as default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
