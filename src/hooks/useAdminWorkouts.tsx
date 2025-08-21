import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AdminWorkout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
  days_of_week?: string[] | null;
};

export type WorkoutFormData = {
  name: string;
  description?: string;
  duration: number;
  difficulty_level?: string;
  category_id?: string | null;
  user_id?: string | null; 
  days_of_week?: string[] | null;
};

export type UpdateWorkoutData = WorkoutFormData & {
  id: string;
};

export type WorkoutExercise = {
  exercise_id?: string;
  sets?: number;
  reps?: number | null;
  duration?: number | null;
  rest_time?: number | null;
  order_index: number;
  is_title_section?: boolean;
  section_title?: string | null;
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

      // Add empty days_of_week since the table doesn't exist
      const workoutsWithDays = data.map(workout => ({
        ...workout,
        days_of_week: []
      }));
      
      return workoutsWithDays as AdminWorkout[];
    },
  });

  const createWorkout = useMutation({
    mutationFn: async (formData: WorkoutFormData) => {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          title: formData.name,
          description: formData.description || null,
          duration: formData.duration,
          level: (formData.difficulty_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
          category_id: formData.category_id || null,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error creating workout: ${error.message}`);
      }

      // Skip workout_days operations since table doesn't exist
      console.log('Workout days functionality disabled - table does not exist');
      
      toast('Treino criado com sucesso');
      return { workout: data, exercises: [] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
    },
  });

  const updateWorkout = useMutation({
    mutationFn: async (updateData: UpdateWorkoutData) => {
      const { data, error } = await supabase
        .from('workouts')
        .update({
          title: updateData.name,
          description: updateData.description || null,
          duration: updateData.duration,
          level: (updateData.difficulty_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
          category_id: updateData.category_id || null,
        })
        .eq('id', updateData.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating workout: ${error.message}`);
      }

      // Skip workout_days operations since table doesn't exist
      console.log('Workout days update skipped - table does not exist');

      toast('Treino atualizado com sucesso');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
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

      // Skip workout_days deletion since table doesn't exist
      console.log('Workout days deletion skipped - table does not exist');
      
      toast('Treino excluído com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
    },
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

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');
      
      if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
      
      return data;
    },
  });

  const exercisesQuery = useQuery({
    queryKey: ['admin-exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching exercises: ${error.message}`);
      }
      
      return data;
    },
  });

  const getWorkoutExercises = (workoutId: string) => {
    return useQuery({
      queryKey: ['workout-exercises', workoutId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`
            *,
            exercise:exercise_id (*)
          `)
          .eq('workout_id', workoutId)
          .order('order_index');
        
        if (error) {
          throw new Error(`Error fetching workout exercises: ${error.message}`);
        }
        
        return data;
      },
      enabled: Boolean(workoutId),
    });
  };

  // Get workout recommendations - disabled due to missing table
  const getWorkoutRecommendations = (workoutId: string) => {
    return useQuery({
      queryKey: ['workout-recommendations', workoutId],
      queryFn: async () => {
        console.log('Workout recommendations disabled - table does not exist');
        return [];
      },
      enabled: !!workoutId,
    });
  };

  // Add workout recommendation - disabled due to missing table
  const { mutateAsync: addWorkoutRecommendation, isPending: isAddingRecommendation } = useMutation({
    mutationFn: async ({ workout_id, user_id }: { workout_id: string; user_id: string | null }) => {
      console.log('Workout recommendations disabled - table does not exist');
      throw new Error('Workout recommendations table does not exist');
    },
    onSuccess: () => {
      toast('Recommendation functionality disabled');
    },
  });

  // Remove workout recommendation - disabled due to missing table
  const { mutateAsync: removeWorkoutRecommendation, isPending: isRemovingRecommendation } = useMutation({
    mutationFn: async ({ recommendationId, workoutId }: { recommendationId: string; workoutId: string }) => {
      console.log('Workout recommendations disabled - table does not exist');
      throw new Error('Workout recommendations table does not exist');
    },
    onSuccess: () => {
      toast('Remove recommendation functionality disabled');
    },
  });

  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    error: workoutsQuery.error,
    createWorkout: createWorkout.mutate,
    isCreating: createWorkout.isPending,
    updateWorkout: updateWorkout.mutateAsync,
    isUpdating: updateWorkout.isPending,
    deleteWorkout: deleteWorkout.mutate,
    isDeleting: deleteWorkout.isPending,
    categories: workoutCategoriesQuery.data || [],
    areCategoriesLoading: workoutCategoriesQuery.isLoading,
    users: usersQuery.data || [],
    areUsersLoading: usersQuery.isLoading,
    exercises: exercisesQuery.data || [],
    areExercisesLoading: exercisesQuery.isLoading,
    getWorkoutExercises,
    getWorkoutRecommendations,
    addWorkoutRecommendation,
    isAddingRecommendation,
    removeWorkoutRecommendation,
    isRemovingRecommendation,
  };
}