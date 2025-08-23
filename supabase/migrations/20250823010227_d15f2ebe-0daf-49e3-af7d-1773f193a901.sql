-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('exercises', 'exercises', true),
  ('products', 'products', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for exercises bucket
CREATE POLICY "Anyone can view exercise files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'exercises');

CREATE POLICY "Admins can upload exercise files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'exercises' AND is_admin());

CREATE POLICY "Admins can update exercise files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'exercises' AND is_admin());

CREATE POLICY "Admins can delete exercise files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'exercises' AND is_admin());

-- Create storage policies for products bucket
CREATE POLICY "Anyone can view product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND is_admin());

CREATE POLICY "Admins can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products' AND is_admin());

CREATE POLICY "Admins can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products' AND is_admin());

-- Create storage policies for avatars bucket
CREATE POLICY "Anyone can view avatar images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create missing PIX admin functions
CREATE OR REPLACE FUNCTION public.admin_add_pix_key(
  key_type_val text,
  key_value_val text,
  recipient_name_val text,
  is_primary_val boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'message', 'Only administrators can add PIX keys');
  END IF;

  -- If this is set as primary, remove primary status from other keys
  IF is_primary_val THEN
    UPDATE pix_keys SET is_primary = false;
  END IF;

  -- Insert the new PIX key
  INSERT INTO pix_keys (key_type, key_value, recipient_name, is_primary)
  VALUES (key_type_val, key_value_val, recipient_name_val, is_primary_val);

  RETURN json_build_object('success', true, 'message', 'PIX key added successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error adding PIX key: ' || SQLERRM);
END;
$$;

-- Create function to save payment settings
CREATE OR REPLACE FUNCTION public.admin_save_payment_settings(
  accept_card_payments_val boolean,
  accept_pix_payments_val boolean,
  accept_monthly_fee_val boolean,
  monthly_fee_amount_val numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'message', 'Only administrators can modify payment settings');
  END IF;

  -- Update or insert payment settings
  INSERT INTO payment_settings (
    accept_card_payments, 
    accept_pix_payments, 
    accept_monthly_fee, 
    monthly_fee_amount
  )
  VALUES (
    accept_card_payments_val, 
    accept_pix_payments_val, 
    accept_monthly_fee_val, 
    monthly_fee_amount_val
  )
  ON CONFLICT (id) DO UPDATE SET
    accept_card_payments = accept_card_payments_val,
    accept_pix_payments = accept_pix_payments_val,
    accept_monthly_fee = accept_monthly_fee_val,
    monthly_fee_amount = monthly_fee_amount_val,
    updated_at = now();

  RETURN json_build_object('success', true, 'message', 'Payment settings saved successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error saving payment settings: ' || SQLERRM);
END;
$$;

-- Fix foreign key constraint for products table - it should reference product_categories, not workout_categories
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL;