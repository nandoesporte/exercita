-- Create enums for physiotherapy app
CREATE TYPE public.patient_condition AS ENUM (
  'lombalgia',
  'cervicalgia', 
  'pos_cirurgia',
  'tendinite',
  'artrose',
  'lesao_joelho',
  'lesao_ombro',
  'acidente_trabalho',
  'avc_reabilitacao',
  'fraturas',
  'outros'
);

CREATE TYPE public.pain_level AS ENUM ('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');

CREATE TYPE public.mobility_level AS ENUM ('baixa', 'media', 'alta');

CREATE TYPE public.exercise_type AS ENUM (
  'fortalecimento',
  'alongamento', 
  'mobilizacao',
  'respiratorio',
  'equilibrio',
  'coordenacao',
  'resistencia'
);

-- Update profiles table for physiotherapy context
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS conditions patient_condition[],
ADD COLUMN IF NOT EXISTS initial_pain_level pain_level,
ADD COLUMN IF NOT EXISTS current_mobility mobility_level,
ADD COLUMN IF NOT EXISTS medical_restrictions text,
ADD COLUMN IF NOT EXISTS physiotherapist_notes text;

-- Create therapy_sessions table (appointments for physiotherapy)
CREATE TABLE public.therapy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'presencial',
  status TEXT NOT NULL DEFAULT 'agendada',
  therapist_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own therapy sessions"
ON public.therapy_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own therapy sessions"
ON public.therapy_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own therapy sessions"
ON public.therapy_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all therapy sessions"
ON public.therapy_sessions FOR ALL
USING (is_admin(auth.uid()));

-- Create daily_symptoms table for tracking pain and symptoms
CREATE TABLE public.daily_symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_level pain_level NOT NULL,
  stiffness_level INTEGER CHECK (stiffness_level >= 0 AND stiffness_level <= 10),
  fatigue_level INTEGER CHECK (fatigue_level >= 0 AND fatigue_level <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_symptoms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own daily symptoms"
ON public.daily_symptoms FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily symptoms"
ON public.daily_symptoms FOR SELECT
USING (is_admin(auth.uid()));

-- Update exercises table for physiotherapy context
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS exercise_type exercise_type,
ADD COLUMN IF NOT EXISTS target_conditions patient_condition[],
ADD COLUMN IF NOT EXISTS precautions text,
ADD COLUMN IF NOT EXISTS contraindications text;

-- Update workout_categories for therapy protocols  
UPDATE public.workout_categories 
SET name = CASE 
  WHEN name ILIKE '%cardio%' THEN 'Respiratório'
  WHEN name ILIKE '%força%' OR name ILIKE '%strength%' THEN 'Fortalecimento'
  WHEN name ILIKE '%flex%' THEN 'Alongamento'
  ELSE 'Reabilitação Geral'
END;

-- Insert physiotherapy-specific categories
INSERT INTO public.workout_categories (name, color, icon) VALUES
('Lombar', '#00CB7E', '🏥'),
('Cervical', '#FF6B6B', '💪'),
('Joelho', '#4ECDC4', '🦵'),
('Ombro', '#45B7D1', '💪'),
('Respiratório', '#96CEB4', '🫁'),
('Equilíbrio', '#FFEAA7', '⚖️'),
('Pós-Cirúrgico', '#DDA0DD', '🏥')
ON CONFLICT DO NOTHING;

-- Update workouts table 
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS target_conditions patient_condition[],
ADD COLUMN IF NOT EXISTS difficulty_progression INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS requires_supervision BOOLEAN DEFAULT false;

-- Rename workouts to therapy protocols
UPDATE public.workouts 
SET title = 'Protocolo ' || title
WHERE title NOT ILIKE 'protocolo%';

-- Create exercise_progress table for tracking user improvement
CREATE TABLE public.exercise_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_reps INTEGER,
  completed_sets INTEGER,
  pain_during_exercise pain_level,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own exercise progress"
ON public.exercise_progress FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all exercise progress"
ON public.exercise_progress FOR SELECT
USING (is_admin(auth.uid()));

-- Create educational_content table
CREATE TABLE public.educational_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  target_conditions patient_condition[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Published content is viewable by everyone"
ON public.educational_content FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all educational content"
ON public.educational_content FOR ALL
USING (is_admin(auth.uid()));

-- Insert some sample educational content
INSERT INTO public.educational_content (title, content, category, target_conditions) VALUES
('Postura Correta no Trabalho', 'Mantenha os pés apoiados no chão, coluna ereta e monitor na altura dos olhos...', 'Prevenção', ARRAY['lombalgia', 'cervicalgia']::patient_condition[]),
('Cuidados Pós-Cirúrgicos', 'Nos primeiros dias após a cirurgia é importante...', 'Pós-Operatório', ARRAY['pos_cirurgia']::patient_condition[]),
('Exercícios de Respiração', 'A respiração diafragmática ajuda na recuperação...', 'Técnicas', ARRAY['avc_reabilitacao', 'pos_cirurgia']::patient_condition[]),
('Prevenção de Lesões no Joelho', 'Fortalecer o quadríceps e alongar a musculatura posterior...', 'Prevenção', ARRAY['lesao_joelho', 'artrose']::patient_condition[]);