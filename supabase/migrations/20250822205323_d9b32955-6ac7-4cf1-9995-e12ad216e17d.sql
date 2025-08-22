-- Create sample workout categories
INSERT INTO workout_categories (name, icon, color) VALUES
('Cardio', '🏃', '#FF6B6B'),
('Força', '💪', '#4ECDC4'),
('Flexibilidade', '🧘', '#45B7D1'),
('HIIT', '⚡', '#96CEB4'),
('Funcional', '🏋️', '#FFEAA7'),
('Alongamento', '🤸', '#DDA0DD')
ON CONFLICT (name) DO NOTHING;