
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

  // Improved storage bucket check function with auto-creation attempt
  const checkStorageBucket = async (): Promise<boolean> => {
    try {
      // First, check if the bucket exists
      const { data: bucketData, error: getBucketError } = await supabase.storage.getBucket('exercises');
      
      if (!getBucketError && bucketData) {
        console.log("Exercise storage bucket found");
        return true;
      }
      
      console.log("Storage bucket error:", getBucketError?.message);
      
      // Attempt to create the bucket if it doesn't exist
      if (getBucketError && getBucketError.message.includes('not found')) {
        try {
          const { data: newBucket, error: createError } = await supabase.storage.createBucket('exercises', {
            public: true,
            fileSizeLimit: 5242880 // 5MB limit
          });
          
          if (!createError && newBucket) {
            console.log("Successfully created exercises bucket");
            toast.success("Storage bucket created successfully");
            return true;
          }
          
          console.error("Failed to create bucket:", createError?.message);
          toast.error(`Storage bucket creation failed: ${createError?.message}`);
          return false;
        } catch (createErr: any) {
          console.error("Error creating bucket:", createErr);
          toast.error("Failed to create storage bucket. You may need admin permissions.");
          return false;
        }
      }
      
      toast.error("Storage configuration issue: " + (getBucketError?.message || "Unknown error"));
      return false;
    } catch (error: any) {
      console.error("Unexpected error checking/creating storage bucket:", error);
      toast.error("Storage configuration error: " + error.message);
      return false;
    }
  };

  // Function to upload a file to the storage bucket
  const uploadExerciseImage = async (file: File): Promise<string> => {
    try {
      // Check if storage bucket exists/is accessible
      const bucketExists = await checkStorageBucket();
      if (!bucketExists) {
        throw new Error("Storage bucket not available or not properly configured.");
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file to Supabase Storage with exponential backoff retry
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          const { data, error } = await supabase.storage
            .from('exercises')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: attempts > 0 // Try upsert on retry attempts
            });
          
          if (error) {
            lastError = error;
            console.error(`Upload attempt ${attempts + 1} failed:`, error);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts))); // Exponential backoff
            continue;
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('exercises')
            .getPublicUrl(filePath);
          
          return publicUrl;
        } catch (uploadError) {
          lastError = uploadError;
          console.error(`Upload attempt ${attempts + 1} exception:`, uploadError);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts))); // Exponential backoff
        }
      }
      
      throw lastError || new Error("Upload failed after multiple attempts");
    } catch (error: any) {
      console.error("File upload error:", error);
      throw error;
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
    uploadExerciseImage
  };
}
