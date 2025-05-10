
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

  // Enhanced storage bucket check function
  const checkStorageBucket = async (): Promise<boolean> => {
    try {
      // First, check if the bucket exists
      const { data: bucket, error: bucketError } = await supabase.storage.getBucket('exercises');
      
      // If there's an error other than "not found", log it
      if (bucketError && !bucketError.message.includes('not found')) {
        console.error("Error checking storage bucket:", bucketError);
        toast.error(`Storage error: ${bucketError.message}`);
        return false;
      }
      
      // If the bucket exists, return true
      if (bucket) {
        console.log("Exercise storage bucket found");
        return true;
      }
      
      // If the bucket doesn't exist, try to create it
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('exercises', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error("Error creating storage bucket:", createError);
        toast.error(`Failed to create storage: ${createError.message}`);
        return false;
      }
      
      console.log("Exercise storage bucket created successfully");
      toast.success("Storage setup completed");
      return true;
    } catch (error) {
      console.error("Unexpected error with storage bucket:", error);
      toast.error("Storage configuration error");
      return false;
    }
  };

  // Function to upload a file to the storage bucket
  const uploadExerciseImage = async (file: File): Promise<string> => {
    try {
      // Check if storage bucket exists/is accessible
      const bucketExists = await checkStorageBucket();
      if (!bucketExists) {
        throw new Error("Storage bucket not available. Please contact an administrator.");
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('exercises')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exercises')
        .getPublicUrl(filePath);
      
      return publicUrl;
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
