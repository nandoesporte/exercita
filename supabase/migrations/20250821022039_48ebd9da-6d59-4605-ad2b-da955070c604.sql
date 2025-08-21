-- Create RLS policies for all tables

-- User-specific data policies
-- Appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can delete appointments" ON public.appointments
  FOR DELETE USING (public.is_admin());

-- Equipment based workouts
CREATE POLICY "Users can view their own equipment workouts" ON public.equipment_based_workouts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own equipment workouts" ON public.equipment_based_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment workouts" ON public.equipment_based_workouts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can delete equipment workouts" ON public.equipment_based_workouts
  FOR DELETE USING (public.is_admin());

-- Orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (public.is_admin());

-- Order items (related to orders)
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR public.is_admin())
  ));

CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- User gym photos
CREATE POLICY "Users can view their own gym photos" ON public.user_gym_photos
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own gym photos" ON public.user_gym_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gym photos" ON public.user_gym_photos
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can delete gym photos" ON public.user_gym_photos
  FOR DELETE USING (public.is_admin());

-- User workout history
CREATE POLICY "Users can view their own workout history" ON public.user_workout_history
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own workout history" ON public.user_workout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history" ON public.user_workout_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete workout history" ON public.user_workout_history
  FOR DELETE USING (public.is_admin());

-- Workout clone history
CREATE POLICY "Users can view workout clone history" ON public.workout_clone_history
  FOR SELECT USING (auth.uid() = target_user_id OR auth.uid() = cloned_by_user_id OR public.is_admin());

CREATE POLICY "Admins can manage workout clone history" ON public.workout_clone_history
  FOR ALL USING (public.is_admin());

-- Workout recommendations
CREATE POLICY "Users can view their own workout recommendations" ON public.workout_recommendations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage workout recommendations" ON public.workout_recommendations
  FOR ALL USING (public.is_admin());

-- Public/shared data policies (read-only for users, full access for admins)
-- Exercises
CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercises" ON public.exercises
  FOR ALL USING (public.is_admin());

-- Gym photo analysis
CREATE POLICY "Users can view gym photo analysis" ON public.gym_photo_analysis
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gym photo analysis" ON public.gym_photo_analysis
  FOR ALL USING (public.is_admin());

-- Workout categories
CREATE POLICY "Anyone can view workout categories" ON public.workout_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout categories" ON public.workout_categories
  FOR ALL USING (public.is_admin());

-- Workout days
CREATE POLICY "Anyone can view workout days" ON public.workout_days
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout days" ON public.workout_days
  FOR ALL USING (public.is_admin());

-- Workout exercises
CREATE POLICY "Anyone can view workout exercises" ON public.workout_exercises
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout exercises" ON public.workout_exercises
  FOR ALL USING (public.is_admin());

-- Workouts
CREATE POLICY "Anyone can view workouts" ON public.workouts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workouts" ON public.workouts
  FOR ALL USING (public.is_admin());

-- Products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Admin-only data policies
-- Payment settings
CREATE POLICY "Admins can manage payment settings" ON public.payment_settings
  FOR ALL USING (public.is_admin());

-- Personal trainers
CREATE POLICY "Anyone can view personal trainers" ON public.personal_trainers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage personal trainers" ON public.personal_trainers
  FOR ALL USING (public.is_admin());

-- PIX keys
CREATE POLICY "Admins can manage PIX keys" ON public.pix_keys
  FOR ALL USING (public.is_admin());