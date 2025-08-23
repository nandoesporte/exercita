import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-wrapper';

export interface WorkoutCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export const useWorkoutCategories = () => {
  const queryClient = useQueryClient();

  // Fetch all workout categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery({
    queryKey: ['workout-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching workout categories:', error);
        throw error;
      }

      return data as WorkoutCategory[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Create category mutation
  const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: async (category: { name: string; color?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('workout_categories')
        .insert({
          name: category.name,
          color: category.color || '#00CB7E',
          icon: category.icon || ''
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkoutCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-categories'] });
      toast.success('Categoria de exercício criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating workout category:', error);
      toast.error('Erro ao criar categoria de exercício');
    },
  });

  // Update category mutation
  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...category }: WorkoutCategory) => {
      const { data, error } = await supabase
        .from('workout_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkoutCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-categories'] });
      toast.success('Categoria de exercício atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating workout category:', error);
      toast.error('Erro ao atualizar categoria de exercício');
    },
  });

  // Delete category mutation
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-categories'] });
      toast.success('Categoria de exercício excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting workout category:', error);
      toast.error('Erro ao excluir categoria de exercício');
    },
  });

  return {
    categories,
    isLoadingCategories,
    categoriesError,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
    isDeleting,
  };
};