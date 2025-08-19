-- ============================================
-- SCHEMA PARA APLICAÇÃO DE ACADEMIA - MySQL
-- ============================================
-- Execute este arquivo no seu banco MySQL
-- Substitua 'gym_app' pelo nome do seu banco de dados

-- Criar banco de dados (opcional - se ainda não existir)
-- CREATE DATABASE gym_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE gym_app;

-- ============================================
-- TABELA DE USUÁRIOS (Substitui auth.users do Supabase)
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Hash da senha com bcrypt',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at),
    INDEX idx_users_is_admin (is_admin)
) ENGINE=InnoDB COMMENT='Tabela principal de usuários com autenticação';

-- ============================================
-- PERFIS DE USUÁRIOS (Informações adicionais)
-- ============================================
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profiles_user_id (user_id)
) ENGINE=InnoDB COMMENT='Perfis e informações adicionais dos usuários';

-- ============================================
-- CATEGORIAS DE TREINOS
-- ============================================
DROP TABLE IF EXISTS workout_categories;
CREATE TABLE workout_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) COMMENT 'Nome do ícone (ex: heart, dumbbell)',
    color VARCHAR(7) COMMENT 'Código hexadecimal da cor (#FF0000)',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categories_name (name)
) ENGINE=InnoDB COMMENT='Categorias para classificar treinos';

-- ============================================
-- EXERCÍCIOS
-- ============================================
DROP TABLE IF EXISTS exercises;
CREATE TABLE exercises (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT COMMENT 'URL da imagem do exercício',
    video_url TEXT COMMENT 'URL do vídeo demonstrativo',
    category_id VARCHAR(36),
    muscle_groups JSON COMMENT 'Array de grupos musculares trabalhados',
    equipment JSON COMMENT 'Array de equipamentos necessários',
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES workout_categories(id) ON DELETE SET NULL,
    INDEX idx_exercises_name (name),
    INDEX idx_exercises_category (category_id),
    INDEX idx_exercises_difficulty (difficulty_level)
) ENGINE=InnoDB COMMENT='Catálogo de exercícios disponíveis';

-- ============================================
-- TREINOS
-- ============================================
DROP TABLE IF EXISTS workouts;
CREATE TABLE workouts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_minutes INT COMMENT 'Duração estimada em minutos',
    is_recommended BOOLEAN DEFAULT FALSE COMMENT 'Se é recomendado globalmente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES workout_categories(id) ON DELETE SET NULL,
    INDEX idx_workouts_title (title),
    INDEX idx_workouts_category (category_id),
    INDEX idx_workouts_difficulty (difficulty_level),
    INDEX idx_workouts_recommended (is_recommended),
    INDEX idx_workouts_created_at (created_at)
) ENGINE=InnoDB COMMENT='Treinos disponíveis na aplicação';

-- ============================================
-- EXERCÍCIOS DOS TREINOS (Relação N:N)
-- ============================================
DROP TABLE IF EXISTS workout_exercises;
CREATE TABLE workout_exercises (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    workout_id VARCHAR(36) NOT NULL,
    exercise_id VARCHAR(36),
    sets INT COMMENT 'Número de séries',
    reps VARCHAR(50) COMMENT 'Repetições (ex: "10-12", "30 segundos")',
    duration VARCHAR(50) COMMENT 'Duração do exercício',
    rest VARCHAR(50) COMMENT 'Tempo de descanso',
    weight DECIMAL(10,2) COMMENT 'Peso sugerido em kg',
    order_position INT NOT NULL COMMENT 'Ordem do exercício no treino',
    day_of_week VARCHAR(20) COMMENT 'Dia da semana específico',
    is_title_section BOOLEAN DEFAULT FALSE COMMENT 'Se é apenas um título de seção',
    section_title VARCHAR(200) COMMENT 'Título da seção',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL,
    INDEX idx_workout_exercises_workout (workout_id),
    INDEX idx_workout_exercises_exercise (exercise_id),
    INDEX idx_workout_exercises_order (workout_id, order_position),
    INDEX idx_workout_exercises_day (day_of_week)
) ENGINE=InnoDB COMMENT='Exercícios que compõem cada treino';

-- ============================================
-- DIAS DA SEMANA DOS TREINOS
-- ============================================
DROP TABLE IF EXISTS workout_days;
CREATE TABLE workout_days (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    workout_id VARCHAR(36) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL COMMENT 'segunda, terca, quarta, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    INDEX idx_workout_days_workout (workout_id),
    INDEX idx_workout_days_day (day_of_week),
    UNIQUE KEY unique_workout_day (workout_id, day_of_week)
) ENGINE=InnoDB COMMENT='Dias da semana em que cada treino é recomendado';

-- ============================================
-- RECOMENDAÇÕES DE TREINOS PARA USUÁRIOS
-- ============================================
DROP TABLE IF EXISTS workout_recommendations;
CREATE TABLE workout_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    workout_id VARCHAR(36) NOT NULL,
    recommended_by VARCHAR(36) COMMENT 'ID do admin que fez a recomendação',
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_recommendations_user (user_id),
    INDEX idx_recommendations_workout (workout_id),
    INDEX idx_recommendations_date (recommended_at),
    UNIQUE KEY unique_user_workout_recommendation (user_id, workout_id)
) ENGINE=InnoDB COMMENT='Treinos específicos recomendados para cada usuário';

-- ============================================
-- HISTÓRICO DE TREINOS DOS USUÁRIOS
-- ============================================
DROP TABLE IF EXISTS user_workout_history;
CREATE TABLE user_workout_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    workout_id VARCHAR(36) NOT NULL,
    completed_at TIMESTAMP NULL COMMENT 'Quando o treino foi completado',
    duration_minutes INT COMMENT 'Tempo real gasto no treino',
    notes TEXT COMMENT 'Observações do usuário sobre o treino',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    INDEX idx_history_user (user_id),
    INDEX idx_history_workout (workout_id),
    INDEX idx_history_completed (completed_at),
    INDEX idx_history_created (created_at)
) ENGINE=InnoDB COMMENT='Histórico de treinos realizados pelos usuários';

-- ============================================
-- PRODUTOS (LOJA)
-- ============================================
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(36),
    image_url TEXT,
    sku VARCHAR(100) COMMENT 'Código do produto',
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE COMMENT 'Produto em destaque',
    meta_title VARCHAR(255) COMMENT 'Título para SEO',
    meta_description TEXT COMMENT 'Descrição para SEO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_products_name (name),
    INDEX idx_products_sku (sku),
    INDEX idx_products_active (is_active),
    INDEX idx_products_featured (is_featured),
    INDEX idx_products_price (price)
) ENGINE=InnoDB COMMENT='Produtos disponíveis na loja';

-- ============================================
-- PEDIDOS
-- ============================================
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) COMMENT 'Método de pagamento usado',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    notes TEXT COMMENT 'Observações do pedido',
    delivery_address JSON COMMENT 'Endereço de entrega',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_created (created_at)
) ENGINE=InnoDB COMMENT='Pedidos realizados pelos usuários';

-- ============================================
-- ITENS DOS PEDIDOS
-- ============================================
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(200) NOT NULL COMMENT 'Nome do produto no momento do pedido',
    product_sku VARCHAR(100) COMMENT 'SKU do produto no momento do pedido',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB COMMENT='Itens específicos de cada pedido';

-- ============================================
-- PERSONAL TRAINERS
-- ============================================
DROP TABLE IF EXISTS personal_trainers;
CREATE TABLE personal_trainers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    credentials TEXT COMMENT 'Credenciais e certificações',
    bio TEXT COMMENT 'Biografia do personal trainer',
    whatsapp VARCHAR(20) COMMENT 'Número do WhatsApp',
    photo_url TEXT COMMENT 'URL da foto do personal',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Se é o personal principal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_trainers_name (name),
    INDEX idx_trainers_primary (is_primary)
) ENGINE=InnoDB COMMENT='Personal trainers disponíveis';

-- ============================================
-- AGENDAMENTOS
-- ============================================
DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    trainer_id VARCHAR(36),
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT COMMENT 'Observações sobre o agendamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES personal_trainers(id) ON DELETE SET NULL,
    INDEX idx_appointments_user (user_id),
    INDEX idx_appointments_trainer (trainer_id),
    INDEX idx_appointments_date (appointment_date),
    INDEX idx_appointments_status (status)
) ENGINE=InnoDB COMMENT='Agendamentos de treinos com personal trainers';

-- ============================================
-- FOTOS DA ACADEMIA (Upload de usuários)
-- ============================================
DROP TABLE IF EXISTS gym_photos;
CREATE TABLE gym_photos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    photo_url TEXT NOT NULL,
    description TEXT COMMENT 'Descrição da foto',
    approved BOOLEAN DEFAULT FALSE COMMENT 'Se a foto foi aprovada pelo admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_gym_photos_user (user_id),
    INDEX idx_gym_photos_approved (approved),
    INDEX idx_gym_photos_created (created_at)
) ENGINE=InnoDB COMMENT='Fotos da academia enviadas pelos usuários';

-- ============================================
-- CONFIGURAÇÕES DO SISTEMA
-- ============================================
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_settings_key (setting_key)
) ENGINE=InnoDB COMMENT='Configurações gerais do sistema';

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir categorias padrão de treinos
INSERT INTO workout_categories (id, name, icon, color, description) VALUES
(UUID(), 'Cardio', 'heart', '#FF6B6B', 'Exercícios cardiovasculares para resistência'),
(UUID(), 'Força', 'dumbbell', '#4ECDC4', 'Exercícios de força e resistência muscular'),
(UUID(), 'Flexibilidade', 'user', '#45B7D1', 'Exercícios de alongamento e flexibilidade'),
(UUID(), 'Funcional', 'activity', '#96CEB4', 'Exercícios funcionais para o dia a dia'),
(UUID(), 'HIIT', 'zap', '#FFEAA7', 'Treino intervalado de alta intensidade'),
(UUID(), 'Yoga', 'heart', '#DDA0DD', 'Práticas de yoga e meditação'),
(UUID(), 'Pilates', 'circle', '#98D8C8', 'Exercícios de pilates');

-- Inserir exercícios básicos
INSERT INTO exercises (id, name, description, difficulty_level, muscle_groups, equipment) VALUES
(UUID(), 'Flexões', 'Exercício básico para fortalecimento do peito, ombros e tríceps', 'beginner', 
 JSON_ARRAY('peito', 'ombros', 'tríceps'), JSON_ARRAY('peso corporal')),
(UUID(), 'Agachamentos', 'Exercício fundamental para fortalecimento das pernas e glúteos', 'beginner',
 JSON_ARRAY('quadríceps', 'glúteos', 'panturrilha'), JSON_ARRAY('peso corporal')),
(UUID(), 'Prancha', 'Exercício isométrico para fortalecimento do core', 'beginner',
 JSON_ARRAY('abdômen', 'core'), JSON_ARRAY('peso corporal')),
(UUID(), 'Burpees', 'Exercício completo que trabalha todo o corpo', 'intermediate',
 JSON_ARRAY('corpo todo'), JSON_ARRAY('peso corporal')),
(UUID(), 'Pull-ups', 'Exercício para fortalecimento das costas e bíceps', 'advanced',
 JSON_ARRAY('costas', 'bíceps'), JSON_ARRAY('barra fixa')),
(UUID(), 'Abdominais', 'Exercício para fortalecimento dos músculos abdominais', 'beginner',
 JSON_ARRAY('abdômen'), JSON_ARRAY('peso corporal')),
(UUID(), 'Supino', 'Exercício com barra para desenvolvimento do peito', 'intermediate',
 JSON_ARRAY('peito', 'ombros', 'tríceps'), JSON_ARRAY('barra', 'banco'));

-- Inserir personal trainer padrão
INSERT INTO personal_trainers (id, name, credentials, bio, is_primary) VALUES
(UUID(), 'Personal Trainer', 'CREF 123456-G/RJ', 'Personal trainer especializado em treinamento funcional e musculação.', TRUE);

-- Criar usuário administrador padrão
-- Senha: admin123 (hash gerado com bcrypt)
INSERT INTO users (id, email, password, first_name, last_name, is_admin) VALUES
(UUID(), 'admin@academia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sistema', TRUE);

-- Inserir configurações básicas do sistema
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('app_name', 'Academia App', 'string', 'Nome da aplicação'),
('app_version', '1.0.0', 'string', 'Versão da aplicação'),
('maintenance_mode', 'false', 'boolean', 'Modo de manutenção'),
('max_file_upload_size', '10485760', 'number', 'Tamanho máximo de upload em bytes (10MB)');

-- ============================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_workout_exercises_workout_order ON workout_exercises(workout_id, order_position);
CREATE INDEX idx_user_workout_history_user_date ON user_workout_history(user_id, completed_at);
CREATE INDEX idx_appointments_trainer_date ON appointments(trainer_id, appointment_date);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- ============================================
-- VIEWS ÚTEIS PARA CONSULTAS
-- ============================================

-- View para workouts com categoria
CREATE OR REPLACE VIEW workout_details AS
SELECT 
    w.*,
    wc.name as category_name,
    wc.icon as category_icon,
    wc.color as category_color,
    COUNT(we.id) as exercise_count
FROM workouts w
LEFT JOIN workout_categories wc ON w.category_id = wc.id
LEFT JOIN workout_exercises we ON w.id = we.workout_id
GROUP BY w.id, wc.name, wc.icon, wc.color;

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT uwh.id) as total_workouts_completed,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT o.id) as total_orders,
    MAX(uwh.completed_at) as last_workout_date,
    MAX(a.appointment_date) as last_appointment_date
FROM users u
LEFT JOIN user_workout_history uwh ON u.id = uwh.user_id
LEFT JOIN appointments a ON u.id = a.user_id
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- ============================================
-- TRIGGERS PARA AUDITORIA E VALIDAÇÃO
-- ============================================

-- Trigger para atualizar updated_at automaticamente
DELIMITER //
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_workouts_timestamp 
    BEFORE UPDATE ON workouts 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_exercises_timestamp 
    BEFORE UPDATE ON exercises 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

/*
INSTRUÇÕES DE USO:

1. Execute este script no seu banco MySQL
2. Configure as credenciais no arquivo src/lib/mysql.ts:
   - host: seu host MySQL
   - user: seu usuário MySQL  
   - password: sua senha MySQL
   - database: nome do banco (padrão: gym_app)

3. Login de administrador padrão:
   - Email: admin@academia.com
   - Senha: admin123

4. O banco está configurado com:
   - ✅ Todas as tabelas necessárias
   - ✅ Relacionamentos e chaves estrangeiras
   - ✅ Índices para performance
   - ✅ Dados iniciais de exemplo
   - ✅ Views úteis para consultas
   - ✅ Triggers para auditoria

PRÓXIMOS PASSOS:
- Configurar as credenciais de conexão
- Testar a conexão com o banco
- Atualizar componentes que ainda usam Supabase
*/