import bcrypt from 'bcryptjs';
// Removed jsonwebtoken - not compatible with browser environment
import { executeQuery, executeQuerySingle, executeInsert } from './mysql';

// Simple session token generation (for demo purposes)
// In production, use a proper backend with JWT
const generateSessionToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export const login = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log('MySQL login attempt for:', email);
    
    // For demo purposes, create a simple admin user check
    if (email === 'admin@academia.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@academia.com',
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const token = generateSessionToken();
      
      // Store user data in localStorage for demo
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(adminUser));
      
      return { 
        success: true, 
        user: adminUser, 
        token 
      };
    }
    
    // TODO: Implement actual MySQL user validation
    // const user = await executeQuerySingle<User>(
    //   'SELECT * FROM users WHERE email = ?',
    //   [email]
    // );
    
    return { 
      success: false, 
      error: 'MySQL authentication will be implemented soon. Use admin@academia.com / admin123 for demo.' 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: 'Authentication error' 
    };
  }
};

export const register = async (userData: RegisterData): Promise<AuthResult> => {
  try {
    console.log('MySQL registration attempt for:', userData.email);
    
    // TODO: Implement MySQL user registration
    // const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // const userId = await executeInsert(
    //   'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
    //   [userData.email, hashedPassword, userData.firstName, userData.lastName]
    // );

    // const user: User = {
    //   id: userId.toString(),
    //   email: userData.email,
    //   first_name: userData.firstName,
    //   last_name: userData.lastName,
    //   is_admin: false,
    //   created_at: new Date().toISOString(),
    //   updated_at: new Date().toISOString()
    // };

    // const token = generateSessionToken();
    // return { success: true, user, token };
    
    return { 
      success: false, 
      error: 'MySQL registration will be implemented soon.' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      error: 'Registration failed' 
    };
  }
};

export const validateToken = async (token: string): Promise<User | null> => {
  try {
    // For demo purposes, check localStorage
    const userData = localStorage.getItem('user_data');
    const storedToken = localStorage.getItem('auth_token');
    
    if (token === storedToken && userData) {
      return JSON.parse(userData);
    }
    
    // TODO: Implement actual token validation with MySQL
    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};

export const logout = (): void => {
  // Clear localStorage demo data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};
