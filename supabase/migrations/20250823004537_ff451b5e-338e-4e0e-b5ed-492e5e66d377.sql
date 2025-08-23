-- Adicionar políticas de segurança para a tabela product_categories
CREATE POLICY "Anyone can view product categories" 
ON public.product_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage product categories" 
ON public.product_categories 
FOR ALL 
USING (is_admin());

-- Adicionar trigger para updated_at na tabela product_categories
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();