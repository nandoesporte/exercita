
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { verifyStorageAccess, uploadExerciseFile } from '@/integrations/supabase/storageClient';
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

  // Updated storage bucket check function using the specialized storage client
  const checkStorageBucket = async (): Promise<boolean> => {
    try {
      console.log("Checking storage bucket configuration...");
      
      // Use the improved verifyStorageAccess function
      const isAccessible = await verifyStorageAccess();
      
      if (isAccessible) {
        console.log("Exercise storage bucket verified successfully");
        return true;
      }
      
      console.log("Storage bucket verification failed");
      toast.error("Storage configuration issue detected. Please check the console for more details.");
      return false;
    } catch (error: any) {
      console.error("Unexpected error checking storage bucket:", error);
      toast.error("Storage configuration error: " + error.message);
      return false;
    }
  };

  // Updated function to upload a file to the storage bucket using the improved function
  const uploadExerciseImage = async (file: File): Promise<string> => {
    try {
      // Check if storage bucket exists/is accessible
      const bucketExists = await checkStorageBucket();
      if (!bucketExists) {
        throw new Error("Storage bucket not available or not properly configured.");
      }
      
      // Use the specialized uploadExerciseFile function
      return await uploadExerciseFile(file);
    } catch (error: any) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  return {
    exercises: exercisesQuery.data || [],
    isLoading: exercisesQuery.isLoading,
    error: exercisesQuery.error,
    updateExercise: updateExercise.mutate,
    isUpdating: updateExercise.isPending,
    deleteExercise: deleteExercise.mutate,
    isDeleting: deleteExercise.isPending,
    categories: workoutCategoriesQuery.data || [],
    areCategoriesLoading: workoutCategoriesQuery.isLoading,
    checkStorageBucket,
    uploadExerciseImage
  };
}
