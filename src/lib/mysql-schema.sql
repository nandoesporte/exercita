-- MySQL Database Schema for Gym App

-- Users table (replaces Supabase auth.users)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- Profiles table (additional user information)
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Workout categories
CREATE TABLE workout_categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
);

-- Exercises
CREATE TABLE exercises (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  category_id VARCHAR(36),
  muscle_groups JSON, -- Array of muscle groups
  equipment JSON, -- Array of equipment needed
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES workout_categories(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_category (category_id),
  INDEX idx_difficulty (difficulty_level)
);

-- Workouts
CREATE TABLE workouts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id VARCHAR(36),
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  duration_minutes INT,
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES workout_categories(id) ON DELETE SET NULL,
  INDEX idx_title (title),
  INDEX idx_category (category_id),
  INDEX idx_difficulty (difficulty_level),
  INDEX idx_recommended (is_recommended)
);

-- Workout exercises (relationship between workouts and exercises)
CREATE TABLE workout_exercises (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  workout_id VARCHAR(36) NOT NULL,
  exercise_id VARCHAR(36),
  sets INT,
  reps VARCHAR(50), -- Can be "10-12" or "30 seconds", etc.
  duration VARCHAR(50),
  rest VARCHAR(50),
  weight DECIMAL(10,2),
  order_position INT NOT NULL,
  day_of_week VARCHAR(20),
  is_title_section BOOLEAN DEFAULT FALSE,
  section_title VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL,
  INDEX idx_workout (workout_id),
  INDEX idx_exercise (exercise_id),
  INDEX idx_order (workout_id, order_position)
);

-- Workout days (which days of the week a workout is scheduled)
CREATE TABLE workout_days (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  workout_id VARCHAR(36) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  INDEX idx_workout (workout_id),
  INDEX idx_day (day_of_week),
  UNIQUE KEY unique_workout_day (workout_id, day_of_week)
);

-- Workout recommendations (specific workouts recommended to users)
CREATE TABLE workout_recommendations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  workout_id VARCHAR(36) NOT NULL,
  recommended_by VARCHAR(36), -- Admin who made the recommendation
  recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (recommended_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_workout (workout_id),
  UNIQUE KEY unique_user_workout (user_id, workout_id)
);

-- User workout history
CREATE TABLE user_workout_history (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  workout_id VARCHAR(36) NOT NULL,
  completed_at TIMESTAMP,
  duration_minutes INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_workout (workout_id),
  INDEX idx_completed (completed_at)
);

-- Products
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id VARCHAR(36),
  image_url TEXT,
  sku VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active),
  INDEX idx_featured (is_featured)
);

-- Orders
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Order items
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_name VARCHAR(200) NOT NULL, -- Snapshot of product name at time of order
  product_sku VARCHAR(100), -- Snapshot of product SKU at time of order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- Personal trainers
CREATE TABLE personal_trainers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL,
  credentials TEXT,
  bio TEXT,
  whatsapp VARCHAR(20),
  photo_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_primary (is_primary)
);

-- Appointments
CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  trainer_id VARCHAR(36),
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES personal_trainers(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_trainer (trainer_id),
  INDEX idx_date (appointment_date),
  INDEX idx_status (status)
);

-- Gym photos uploaded by users
CREATE TABLE gym_photos (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_approved (approved),
  INDEX idx_created (created_at)
);

-- Insert default categories
INSERT INTO workout_categories (id, name, icon, color, description) VALUES
(UUID(), 'Cardio', 'heart', '#FF6B6B', 'Exercícios cardiovasculares'),
(UUID(), 'Força', 'dumbbell', '#4ECDC4', 'Exercícios de força e resistência'),
(UUID(), 'Flexibilidade', 'user', '#45B7D1', 'Exercícios de alongamento e flexibilidade'),
(UUID(), 'Funcional', 'activity', '#96CEB4', 'Exercícios funcionais'),
(UUID(), 'HIIT', 'zap', '#FFEAA7', 'Treino intervalado de alta intensidade');

-- Insert sample exercises
INSERT INTO exercises (id, name, description, difficulty_level) VALUES
(UUID(), 'Flexões', 'Exercício básico para peito, ombros e tríceps', 'beginner'),
(UUID(), 'Agachamentos', 'Exercício fundamental para pernas e glúteos', 'beginner'),
(UUID(), 'Prancha', 'Exercício isométrico para fortalecimento do core', 'beginner'),
(UUID(), 'Burpees', 'Exercício completo que trabalha todo o corpo', 'intermediate'),
(UUID(), 'Pull-ups', 'Exercício para fortalecimento das costas e bíceps', 'advanced');

-- Create an admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (id, email, password, first_name, last_name, is_admin) VALUES
(UUID(), 'admin@gym.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', TRUE);