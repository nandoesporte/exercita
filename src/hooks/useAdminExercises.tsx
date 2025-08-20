import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService, categoryService } from '@/lib/database';
import { Exercise, CreateInput, UpdateInput } from '@/types/database';
import { toast } from '@/lib/toast';

export interface AdminExercise extends Exercise {
  category?: { id: string; name: string; icon?: string; color?: string };
}

export interface ExerciseFormData {
  name: string;
  description?: string;
  category_id?: string;
  image_url?: string;
  video_url?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
}

export function useAdminExercises() {
  const queryClient = useQueryClient();
  
  const exercisesQuery = useQuery({
    queryKey: ['admin-exercises'],
    queryFn: async () => {
      const { data, error } = await exerciseService.getAll();
      if (error) throw new Error(error);
      return data.map(exercise => ({ ...exercise, category: undefined })) as AdminExercise[];
    },
  });

  const createExercise = useMutation({
    mutationFn: async (formData: ExerciseFormData) => {
      const { data, error } = await exerciseService.create(formData as CreateInput<Exercise>);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
      toast.success('Exercício criado com sucesso');
    },
  });

  const workoutCategoriesQuery = useQuery({
    queryKey: ['workout-categories'],
    queryFn: async () => {
      const { data, error } = await categoryService.getAll();
      if (error) throw new Error(error);
      return data;
    },
  });

  return {
    exercises: exercisesQuery.data || [],
    isLoading: exercisesQuery.isLoading,
    error: exercisesQuery.error?.message,
    createExercise: createExercise.mutate,
    isCreating: createExercise.isPending,
    updateExercise: () => toast.info('Em desenvolvimento'),
    isUpdating: false,
    deleteExercise: () => toast.info('Em desenvolvimento'),
    isDeleting: false,
    categories: workoutCategoriesQuery.data || [],
    areCategoriesLoading: workoutCategoriesQuery.isLoading,
    batchCreateExercises: () => toast.info('Em desenvolvimento'),
    checkStorageBucket: () => Promise.resolve(true),
  };
}