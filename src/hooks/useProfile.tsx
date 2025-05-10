
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw new Error(`Error fetching profile: ${error.message}`);
      }
      
      return data as Profile;
    },
    enabled: !!user,
  });
  
  const updateProfile = useMutation({
    mutationFn: async (profileData: ProfileUpdate) => {
      if (!user) throw new Error('User must be logged in');
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) {
        throw new Error(`Error updating profile: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });
  
  // New function to upload profile image
  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User must be logged in');
      
      // Generate a unique file path with user ID as prefix
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Error uploading image: ${uploadError.message}`);
      }
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error(`Error updating profile with new avatar: ${updateError.message}`);
      }
      
      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile picture');
    }
  });
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    uploadProfileImage: uploadProfileImage.mutate,
    isUploadingImage: uploadProfileImage.isPending,
  };
}
