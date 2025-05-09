
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
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
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching workouts: ${error.message}`);
      }
      
      return data as Workout[];
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
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`Error fetching workout: ${error.message}`);
      }
      
      return data as Workout & {
        workout_exercises: Array<Database['public']['Tables']['workout_exercises']['Row'] & {
          exercise: Database['public']['Tables']['exercises']['Row'];
        }>;
      };
    },
    enabled: !!id,
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
