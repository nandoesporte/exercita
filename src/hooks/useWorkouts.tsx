
import { useQuery } from '@tanstack/react-query';
import { supabase, workoutDaysClient } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
  workout_exercises?: Array<Database['public']['Tables']['workout_exercises']['Row'] & {
    exercise: Database['public']['Tables']['exercises']['Row'];
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
      
      // Use the helper function to fetch days of week for each workout
      const workoutsWithDays = await Promise.all(data.map(async (workout) => {
        try {
          const days = await workoutDaysClient.getWorkoutDays(workout.id);
          
          return {
            ...workout,
            days_of_week: days
          };
        } catch (error) {
          console.error(`Error fetching days for workout ${workout.id}:`, error);
          return workout;
        }
      }));
      
      return workoutsWithDays as Workout[];
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

      // Create a properly typed object with days_of_week
      const workoutWithDays = data as unknown as Workout;

      try {
        // Fetch days of week for the workout using helper
        const days = await workoutDaysClient.getWorkoutDays(id);
        workoutWithDays.days_of_week = days;
      } catch (error) {
        console.error(`Error fetching days for workout ${id}:`, error);
        workoutWithDays.days_of_week = [];
      }
      
      return workoutWithDays;
    },
    enabled: !!id,
  });
}

export function useWorkoutsByDay(day: string | null) {
  return useQuery({
    queryKey: ['workouts-by-day', day],
    queryFn: async () => {
      if (!day) {
        // For the last error, instead of calling useWorkouts().queryFn directly
        // we need to implement the same logic here
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
        
        // Add the days_of_week to each workout
        const workoutsWithDays = await Promise.all(data.map(async (workout) => {
          const days = await workoutDaysClient.getWorkoutDays(workout.id);
          return {
            ...workout,
            days_of_week: days
          };
        }));
        
        return workoutsWithDays as Workout[];
      }
      
      try {
        // First get workout IDs for the specified day using helper
        const workoutIds = await workoutDaysClient.getWorkoutsByDay(day);
        
        if (workoutIds.length === 0) {
          return [] as Workout[];
        }
        
        // Get the full workout data for these IDs
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
          .in('id', workoutIds)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(`Error fetching workouts: ${error.message}`);
        }
        
        // Add the days_of_week to each workout
        const workoutsWithDays = await Promise.all(data.map(async (workout) => {
          const days = await workoutDaysClient.getWorkoutDays(workout.id);
          return {
            ...workout,
            days_of_week: days
          };
        }));
        
        return workoutsWithDays as Workout[];
      } catch (error) {
        console.error(`Error in useWorkoutsByDay:`, error);
        throw error;
      }
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
