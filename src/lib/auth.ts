import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery, executeQuerySingle, executeInsert } from './mysql';

const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

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

export interface Session {
  access_token: string;
  user: User;
  expires_at: number;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  // Sign up new user
  async signUp(email: string, password: string, metadata?: any): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await executeQuerySingle<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        return { user: null, session: null, error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = await executeInsert(
        `INSERT INTO users (id, email, password, first_name, last_name, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())`,
        [
          email,
          hashedPassword,
          metadata?.first_name || null,
          metadata?.last_name || null
        ]
      );

      // Get the created user
      const user = await executeQuerySingle<User>(
        'SELECT id, email, first_name, last_name, avatar_url, is_admin, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return { user: null, session: null, error: 'Failed to create user' };
      }

      // Create session
      const session = this.createSession(user);
      this.currentUser = user;
      this.currentSession = session;

      // Store session in localStorage
      localStorage.setItem('gym_app_session', JSON.stringify(session));

      return { user, session };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user with password
      const userWithPassword = await executeQuerySingle<User & { password: string }>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!userWithPassword) {
        return { user: null, session: null, error: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userWithPassword.password);
      if (!isValidPassword) {
        return { user: null, session: null, error: 'Invalid credentials' };
      }

      // Remove password from user object
      const { password: _, ...user } = userWithPassword;

      // Create session
      const session = this.createSession(user);
      this.currentUser = user;
      this.currentSession = session;

      // Store session in localStorage
      localStorage.setItem('gym_app_session', JSON.stringify(session));

      return { user, session };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  // Sign out user
  signOut(): void {
    this.currentUser = null;
    this.currentSession = null;
    localStorage.removeItem('gym_app_session');
  }

  // Get current session
  getSession(): Session | null {
    if (this.currentSession && this.currentSession.expires_at > Date.now()) {
      return this.currentSession;
    }

    // Try to get from localStorage
    const storedSession = localStorage.getItem('gym_app_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as Session;
        if (session.expires_at > Date.now()) {
          this.currentSession = session;
          this.currentUser = session.user;
          return session;
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
    }

    return null;
  }

  // Get current user
  getUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  // Create JWT session
  private createSession(user: User): Session {
    const payload = { userId: user.id, email: user.email };
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expires_at = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    return {
      access_token,
      user,
      expires_at
    };
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Update user admin status
  async setAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
    try {
      await executeQuery(
        'UPDATE users SET is_admin = ?, updated_at = NOW() WHERE id = ?',
        [isAdmin, userId]
      );
      
      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.is_admin = isAdmin;
        if (this.currentSession) {
          this.currentSession.user.is_admin = isAdmin;
          localStorage.setItem('gym_app_session', JSON.stringify(this.currentSession));
        }
      }

      return true;
    } catch (error) {
      console.error('Error setting admin status:', error);
      return false;
    }
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return this.getUser()?.is_admin || false;
  }

  // Update user profile
  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && updates[key as keyof User] !== undefined);
      const values = fields.map(key => updates[key as keyof User]);
      
      if (fields.length === 0) return true;

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await executeQuery(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, userId]
      );

      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === userId) {
        Object.assign(this.currentUser, updates);
        if (this.currentSession) {
          Object.assign(this.currentSession.user, updates);
          localStorage.setItem('gym_app_session', JSON.stringify(this.currentSession));
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }
}

export const authService = new AuthService();