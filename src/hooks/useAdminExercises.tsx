import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/lib/toast-wrapper';

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
      try {
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
      } catch (error: any) {
        console.error('Error in exercisesQuery:', error);
        throw error;
      }
    },
  });

  const createExercise = useMutation({
    mutationFn: async (formData: ExerciseFormData) => {
      try {
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
      } catch (error: any) {
        console.error('Error in createExercise:', error);
        throw error;
      }
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
      try {
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
      } catch (error: any) {
        console.error('Error in updateExercise:', error);
        throw error;
      }
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
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw new Error(`Error deleting exercise: ${error.message}`);
        }
      } catch (error: any) {
        console.error('Error in deleteExercise:', error);
        throw error;
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
      try {
        const { data, error } = await supabase
          .from('workout_categories')
          .select('*')
          .order('name');
        
        if (error) {
          throw new Error(`Error fetching workout categories: ${error.message}`);
        }
        
        return data;
      } catch (error: any) {
        console.error('Error in workoutCategoriesQuery:', error);
        throw error;
      }
    },
  });

  // Batch processing 
  const processExerciseBatch = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        // Get the file from formData
        const file = formData.get('file') as File;
        const categoryId = formData.get('categoryId') as string;
        
        if (!file) {
          throw new Error('No file provided');
        }
        
        let exercises: ExerciseFormData[] = [];
        
        // Process file based on type
        if (file.type === 'application/json') {
          const text = await file.text();
          const data = JSON.parse(text);
          exercises = Array.isArray(data) ? data : [data];
        } else if (file.type === 'text/csv') {
          const text = await file.text();
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          exercises = lines.slice(1)
            .filter(line => line.trim() !== '')
            .map(line => {
              const values = line.split(',');
              const exercise: any = {};
              
              headers.forEach((header, i) => {
                if (header === 'name' || 
                    header === 'description' || 
                    header === 'image_url' || 
                    header === 'video_url' || 
                    header === 'category_id') {
                  exercise[header] = values[i]?.trim() || null;
                }
              });
              
              // Set default category_id if provided
              if (categoryId && !exercise.category_id) {
                exercise.category_id = categoryId;
              }
              
              return exercise;
            });
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          // For xlsx processing, you would typically use a library like xlsx
          // This is a placeholder - you might need to add a dependency and implement xlsx parsing
          throw new Error('XLSX parsing not implemented yet');
        } else {
          throw new Error('Unsupported file format');
        }
        
        // Validate exercises have required fields
        const validExercises = exercises.filter(ex => ex.name);
        
        if (validExercises.length === 0) {
          throw new Error('No valid exercises found in file');
        }
        
        // Insert exercises in batch
        const { data, error } = await supabase
          .from('exercises')
          .insert(validExercises);
          
        if (error) {
          throw error;
        }
        
        return { count: validExercises.length };
      } catch (error: any) {
        console.error('Error in processExerciseBatch:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
      toast.success(`${result.count} exercícios importados com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Falha ao processar arquivo');
    }
  });

  // Create bucket check function
  const checkStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('exercises');
      if (error && error.message.includes('not found')) {
        console.warn("Exercise storage bucket does not exist");
        return false;
      }
      return !!data;
    } catch (error) {
      console.error("Error checking storage bucket:", error);
      return false;
    }
  };

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
    areCategoriesLoading: workoutCategoriesQuery.isLoading,
    checkStorageBucket,
    processExerciseBatch: processExerciseBatch.mutate,
    isBatchProcessing: processExerciseBatch.isPending
  };
}
