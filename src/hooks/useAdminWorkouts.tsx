import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AdminWorkout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
  days_of_week?: string[] | null;
};

export type WorkoutFormData = {
  title: string;
  description?: string;
  duration: number;
  level: Database['public']['Enums']['difficulty_level'];
  category_id?: string | null;
  image_url?: string | null;
  calories?: number | null;
  user_id?: string | null; 
  days_of_week?: string[] | null; // Added days_of_week for scheduling workouts
};

export type UpdateWorkoutData = WorkoutFormData & {
  id: string;
};

export type WorkoutExercise = {
  exercise_id: string;
  sets: number;
  reps?: number | null;
  duration?: number | null;
  rest?: number | null;
  weight?: number | null;
  order_position: number;
}

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

      // Fetch days of week for each workout
      const workoutsWithDays = await Promise.all(data.map(async (workout) => {
        const { data: daysData, error: daysError } = await supabase
          .from('workout_days')
          .select('day_of_week')
          .eq('workout_id', workout.id);

        if (daysError) {
          console.error(`Error fetching days for workout ${workout.id}:`, daysError);
          return { ...workout, days_of_week: [] };
        }

        return {
          ...workout,
          days_of_week: daysData.map(d => d.day_of_week)
        };
      }));
      
      return workoutsWithDays as AdminWorkout[];
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

      // If days_of_week are provided, create entries in workout_days
      if (formData.days_of_week && formData.days_of_week.length > 0 && workout) {
        const workoutDaysEntries = formData.days_of_week.map(day => ({
          workout_id: workout.id,
          day_of_week: day
        }));

        const { error: daysError } = await supabase
          .from('workout_days')
          .insert(workoutDaysEntries);
        
        if (daysError) {
          throw new Error(`Error assigning days to workout: ${daysError.message}`);
        }
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

  const updateWorkout = useMutation({
    mutationFn: async (data: UpdateWorkoutData) => {
      const { id, days_of_week, ...workoutData } = data;
      
      // First, update the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          title: workoutData.title,
          description: workoutData.description || null,
          duration: workoutData.duration,
          level: workoutData.level,
          category_id: workoutData.category_id || null,
          image_url: workoutData.image_url || null,
          calories: workoutData.calories || null,
        })
        .eq('id', id);
      
      if (workoutError) {
        throw new Error(`Error updating workout: ${workoutError.message}`);
      }

      // If days_of_week are provided, update the workout days
      if (days_of_week !== undefined) {
        // First delete existing workout days
        const { error: deleteError } = await supabase
          .from('workout_days')
          .delete()
          .eq('workout_id', id);
        
        if (deleteError) {
          throw new Error(`Error removing existing workout days: ${deleteError.message}`);
        }

        // If there are days to add, insert them
        if (days_of_week && days_of_week.length > 0) {
          const workoutDaysEntries = days_of_week.map(day => ({
            workout_id: id,
            day_of_week: day
          }));

          const { error: daysError } = await supabase
            .from('workout_days')
            .insert(workoutDaysEntries);
          
          if (daysError) {
            throw new Error(`Error assigning days to workout: ${daysError.message}`);
          }
        }
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-days'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update workout');
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

  // Fetch all exercises for adding to workouts
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

  // Get workout exercises
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
          .order('order_position');
        
        if (error) {
          throw new Error(`Error fetching workout exercises: ${error.message}`);
        }
        
        return data;
      },
      enabled: !!workoutId,
    });
  };

  // Get workout days
  const getWorkoutDays = (workoutId: string) => {
    return useQuery({
      queryKey: ['workout-days', workoutId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('workout_days')
          .select('day_of_week')
          .eq('workout_id', workoutId);
        
        if (error) {
          throw new Error(`Error fetching workout days: ${error.message}`);
        }
        
        return data.map(d => d.day_of_week);
      },
      enabled: !!workoutId,
    });
  };

  // Add exercise to workout
  const addExerciseToWorkout = useMutation({
    mutationFn: async ({ 
      workoutId, 
      exerciseData 
    }: { 
      workoutId: string, 
      exerciseData: WorkoutExercise 
    }) => {
      const { error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseData.exercise_id,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          duration: exerciseData.duration,
          rest: exerciseData.rest,
          weight: exerciseData.weight,
          order_position: exerciseData.order_position,
        });
      
      if (error) {
        throw new Error(`Error adding exercise to workout: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['workout-exercises', variables.workoutId] 
      });
      toast.success('Exercício adicionado ao treino');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Falha ao adicionar exercício');
    }
  });

  // Remove exercise from workout
  const removeExerciseFromWorkout = useMutation({
    mutationFn: async ({ 
      exerciseId,
      workoutId
    }: { 
      exerciseId: string,
      workoutId: string
    }) => {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (error) {
        throw new Error(`Error removing exercise from workout: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['workout-exercises', variables.workoutId] 
      });
      toast.success('Exercício removido do treino');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Falha ao remover exercício');
    }
  });

  // Update exercise position
  const updateExerciseOrder = useMutation({
    mutationFn: async ({ 
      exerciseId, 
      newPosition,
      workoutId
    }: { 
      exerciseId: string, 
      newPosition: number,
      workoutId: string
    }) => {
      const { error } = await supabase
        .from('workout_exercises')
        .update({ order_position: newPosition })
        .eq('id', exerciseId);
      
      if (error) {
        throw new Error(`Error updating exercise position: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['workout-exercises', variables.workoutId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Falha ao atualizar posição do exercício');
    }
  });
  
  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    error: workoutsQuery.error,
    createWorkout: createWorkout.mutate,
    isCreating: createWorkout.isPending,
    updateWorkout: updateWorkout.mutate,
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
    getWorkoutDays,
    addExerciseToWorkout: addExerciseToWorkout.mutate,
    isAddingExercise: addExerciseToWorkout.isPending,
    removeExerciseFromWorkout: removeExerciseFromWorkout.mutate,
    isRemovingExercise: removeExerciseFromWorkout.isPending,
    updateExerciseOrder: updateExerciseOrder.mutate,
    isUpdatingExerciseOrder: updateExerciseOrder.isPending
  };
}
