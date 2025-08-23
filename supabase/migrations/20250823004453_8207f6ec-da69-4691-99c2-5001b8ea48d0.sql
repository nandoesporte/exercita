-- Corrigir migração anterior sem IF NOT EXISTS para triggers
-- Criar tabela de categorias de produtos para habilitar gerenciamento de categorias
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#00CB7E',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de categorias
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias - todos podem ver, apenas admins podem gerenciar
CREATE POLICY "Anyone can view product categories" 
ON public.product_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage product categories" 
ON public.product_categories 
FOR ALL 
USING (is_admin());

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar se a tabela products já existe, se não criar
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  sale_url TEXT,
  category_id UUID REFERENCES public.product_categories(id),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de produtos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING ((is_active = true) OR is_admin());

CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (is_admin());

-- Trigger para produtos
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar se trigger já existe na tabela user_workout_history antes de criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_workout_history_updated_at'
    ) THEN
        CREATE TRIGGER update_user_workout_history_updated_at
        BEFORE UPDATE ON public.user_workout_history
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Inserir algumas categorias padrão se a tabela estiver vazia
INSERT INTO public.product_categories (name, color, icon) VALUES
('Suplementos', '#00CB7E', 'pill'),
('Equipamentos', '#3B82F6', 'dumbbell'),
('Roupas', '#8B5CF6', 'shirt'),
('Acessórios', '#F59E0B', 'watch')
ON CONFLICT DO NOTHING;