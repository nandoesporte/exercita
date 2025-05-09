
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AdminWorkout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
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
  
  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    error: workoutsQuery.error,
    deleteWorkout: deleteWorkout.mutate,
    isDeleting: deleteWorkout.isPending,
    categories: workoutCategoriesQuery.data || [],
    areCategoriesLoading: workoutCategoriesQuery.isLoading,
  };
}
