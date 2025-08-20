-- Fix security issues from the migration

-- Add missing RLS policies for configuracoes_sistema (admin only access)
CREATE POLICY "Admin users can view configuracoes_sistema" 
ON public.configuracoes_sistema FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

CREATE POLICY "Admin users can modify configuracoes_sistema" 
ON public.configuracoes_sistema FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

-- Add missing RLS policies for regras_resposta_automatica (admin only access)
CREATE POLICY "Admin users can view regras_resposta_automatica" 
ON public.regras_resposta_automatica FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

CREATE POLICY "Admin users can modify regras_resposta_automatica" 
ON public.regras_resposta_automatica FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

-- Add missing RLS policies for site_banners (public read, admin modify)
CREATE POLICY "Site banners are viewable by everyone" 
ON public.site_banners FOR SELECT USING (true);

CREATE POLICY "Admin users can modify site_banners" 
ON public.site_banners FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

CREATE POLICY "Admin users can update site_banners" 
ON public.site_banners FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

CREATE POLICY "Admin users can delete site_banners" 
ON public.site_banners FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE active = true));

-- Fix function security by setting search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;