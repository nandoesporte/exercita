
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AdminExercise = Database['public']['Tables']['exercises']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
};

export type ExerciseFormData = {
  name: string;
  description?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  video_url?: string | null;
};

export function useAdminExercises() {
  const queryClient = useQueryClient();
  
  const exercisesQuery = useQuery({
    queryKey: ['admin-exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          category:category_id (
            id, 
            name,
            icon,
            color
          )
        `)
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching exercises: ${error.message}`);
      }
      
      return data as AdminExercise[];
    },
  });

  const createExercise = useMutation({
    mutationFn: async (formData: ExerciseFormData) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error creating exercise: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
      toast.success('Exercise created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create exercise');
    }
  });

  const updateExercise = useMutation({
    mutationFn: async ({ 
      id, 
      ...formData 
    }: ExerciseFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('exercises')
        .update({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating exercise: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
      toast.success('Exercise updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update exercise');
    }
  });

  const deleteExercise = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Error deleting exercise: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
      toast.success('Exercise deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete exercise');
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
    exercises: exercisesQuery.data || [],
    isLoading: exercisesQuery.isLoading,
    error: exercisesQuery.error,
    createExercise: createExercise.mutate,
    isCreating: createExercise.isPending,
    updateExercise: updateExercise.mutate,
    isUpdating: updateExercise.isPending,
    deleteExercise: deleteExercise.mutate,
    isDeleting: deleteExercise.isPending,
    categories: workoutCategoriesQuery.data || [],
    areCategoriesLoading: workoutCategoriesQuery.isLoading
  };
}
