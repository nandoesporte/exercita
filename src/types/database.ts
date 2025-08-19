export interface User {
  id: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  user_metadata?: { [key: string]: any }; // For backward compatibility
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  birth_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  category_id?: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  created_at?: string;
  updated_at?: string;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  level?: 'beginner' | 'intermediate' | 'advanced'; // Alias for difficulty_level
  duration_minutes?: number;
  duration?: number; // Alias for duration_minutes
  calories?: number;
  image_url?: string;
  is_recommended?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: WorkoutCategory;
  exercises?: WorkoutExercise[];
  workout_exercises?: WorkoutExercise[]; // Alias for exercises
  days_of_week?: string[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id?: string;
  sets?: number;
  reps?: number; // Changed to number for consistency
  duration?: number; // Changed to number (seconds)
  rest?: number; // Changed to number (seconds)  
  weight?: number;
  order_position: number;
  day_of_week?: string;
  is_title_section?: boolean;
  section_title?: string;
  created_at?: string;
  exercise?: Exercise;
}

export interface WorkoutDay {
  id: string;
  workout_id: string;
  day_of_week: string;
  created_at?: string;
}

export interface WorkoutRecommendation {
  id: string;
  user_id: string;
  workout_id: string;
  recommended_by?: string;
  recommended_at?: string;
  created_at?: string;
}

export interface UserWorkoutHistory {
  id: string;
  user_id: string;
  workout_id: string;
  completed_at?: string;
  duration_minutes?: number;
  notes?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  sku?: string;
  stock_quantity?: number;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_sku?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  trainer_id?: string;
  appointment_date: string;
  duration_minutes?: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalTrainer {
  id: string;
  name: string;
  credentials?: string;
  bio?: string;
  whatsapp?: string;
  photo_url?: string;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GymPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  description?: string;
  approved?: boolean;
  created_at?: string;
}

// Database query result types
export interface QueryResult<T> {
  data: T[];
  error?: string;
}

export interface SingleQueryResult<T> {
  data: T | null;
  error?: string;
}

// Utility types
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'created_at'>>;