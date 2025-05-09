
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AdminWorkout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
};

export type WorkoutFormData = {
  title: string;
  description?: string;
  duration: number;
  level: Database['public']['Enums']['difficulty_level'];
  category_id?: string | null;
  image_url?: string | null;
  calories?: number | null;
  user_id?: string | null; // Added user_id for assigning workouts
};

export function useAdminWorkouts() {
  const queryClient = useQueryClient();
  
  const workoutsQuery = useQuery({
    queryKey: ['admin-workouts'],
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
      
      return data as AdminWorkout[];
    },
  });

  const createWorkout = useMutation({
    mutationFn: async (formData: WorkoutFormData) => {
      // First insert the workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          title: formData.title,
          description: formData.description || null,
          duration: formData.duration,
          level: formData.level,
          category_id: formData.category_id || null,
          image_url: formData.image_url || null,
          calories: formData.calories || null,
        })
        .select('id')
        .single();
      
      if (workoutError) {
        throw new Error(`Error creating workout: ${workoutError.message}`);
      }

      // If a user_id was provided, create an entry in user_workout_history
      if (formData.user_id && workout) {
        const { error: historyError } = await supabase
          .from('user_workout_history')
          .insert({
            user_id: formData.user_id,
            workout_id: workout.id,
            completed_at: null, // Not completed yet
          });
        
        if (historyError) {
          throw new Error(`Error assigning workout to user: ${historyError.message}`);
        }
      }
      
      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      toast.success('Workout created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create workout');
    }
  });

  const deleteWorkout = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Error deleting workout: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      toast.success('Workout deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete workout');
    }
  });

  const workoutCategoriesQuery = useQuery({
    queryKey: ['admin-workout-categories'],
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

  // Fetch simplified user data for assigning workouts
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');
      
      if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
      
      return data;
    },
  });
  
  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    error: workoutsQuery.error,
    createWorkout: createWorkout.mutate,
    isCreating: createWorkout.isPending,
    deleteWorkout: deleteWorkout.mutate,
    isDeleting: deleteWorkout.isPending,
    categories: workoutCategoriesQuery.data || [],
    areCategoriesLoading: workoutCategoriesQuery.isLoading,
    users: usersQuery.data || [],
    areUsersLoading: usersQuery.isLoading,
  };
}
