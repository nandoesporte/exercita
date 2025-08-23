-- Criar apenas as tabelas que ainda não existem sem conflitos de políticas
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#00CB7E',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de categorias apenas se ainda não estiver habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'product_categories' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Inserir categorias padrão se a tabela estiver vazia
INSERT INTO public.product_categories (name, color, icon) VALUES
('Suplementos', '#00CB7E', 'pill'),
('Equipamentos', '#3B82F6', 'dumbbell'),
('Roupas', '#8B5CF6', 'shirt'),
('Acessórios', '#F59E0B', 'watch')
ON CONFLICT DO NOTHING;