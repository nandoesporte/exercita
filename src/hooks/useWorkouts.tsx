
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
  workout_exercises?: Array<Database['public']['Tables']['workout_exercises']['Row'] & {
    exercise?: Database['public']['Tables']['exercises']['Row'] | null;
    day_of_week?: string | null;
    is_title_section?: boolean;
    section_title?: string | null;
  }>;
  days_of_week?: string[];
};

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          category:category_id (
            id, 
            name,
            icon,
            color
          ),
          workout_exercises (
            id,
            sets,
            reps,
            duration,
            rest,
            order_position,
            exercise:exercise_id (
              id,
              name,
              description,
              image_url,
              video_url
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching workouts: ${error.message}`);
      }
      
      // Fetch days of week disabled - workout_days table doesn't exist
      return data as any;
    },
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: async () => {
      if (!id) throw new Error('Workout ID is required');
      
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          category:category_id (
            id, 
            name,
            icon,
            color
          ),
          workout_exercises (
            id,
            sets,
            reps,
            duration,
            rest,
            weight,
            order_position,
            day_of_week,
            is_title_section,
            section_title,
            exercise:exercise_id (
              id,
              name,
              description,
              image_url,
              video_url
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`Error fetching workout: ${error.message}`);
      }

      // Fetch days of week disabled - workout_days table doesn't exist
      return data as any;
    },
    enabled: Boolean(id),
  });
}

export function useWorkoutsByDay(day: string | null) {
  return useQuery({
    queryKey: ['workouts-by-day', day],
    queryFn: async () => {
      if (!day) {
        // Create a new query directly instead of calling useWorkouts().queryFn
        // which doesn't exist in the returned result from useQuery
        const { data: allWorkouts, error } = await supabase
          .from('workouts')
          .select(`
            *,
            category:category_id (
              id, 
              name,
              icon,
              color
            ),
            workout_exercises (
              id,
              sets,
              reps,
              duration,
              rest,
              order_position,
              exercise:exercise_id (
                id,
                name,
                description,
                image_url,
                video_url
              )
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(`Error fetching workouts: ${error.message}`);
        }
        
        // Fetch days of week disabled - workout_days table doesn't exist        
        return allWorkouts as any;
      }
      
      // Workouts by day functionality disabled - workout_days table doesn't exist
      return [] as Workout[];
    },
    enabled: true,
  });
}

export function useWorkoutCategories() {
  return useQuery({
    queryKey: ['workout-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_categories')
        .select('*')
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching workout categories: ${error.message}`);
      }
      
      return data;
    },
  });
}

// Função modificada para obter apenas treinos específicos para um usuário
export function useRecommendedWorkoutsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['recommended-workouts-for-user', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided to useRecommendedWorkoutsForUser, returning empty array');
        return [];
      }
      
      // Recommended workouts functionality disabled - workout_recommendations table doesn't exist
      console.log('Recommended workouts functionality disabled');
      return [];
    },
    enabled: !!userId,
  });
}
