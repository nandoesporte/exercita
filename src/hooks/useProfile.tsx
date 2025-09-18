import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/lib/toast-wrapper';

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  height?: number | null;
  weight?: number | null;
  birthdate?: string | null;
  gender?: string | null;
  conditions?: ('lombalgia' | 'cervicalgia' | 'pos_cirurgia' | 'tendinite' | 'artrose' | 'lesao_joelho' | 'lesao_ombro' | 'acidente_trabalho' | 'avc_reabilitacao' | 'fraturas' | 'outros')[] | null;
  initial_pain_level?: ('0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10') | null;
  current_mobility?: ('baixa' | 'media' | 'alta') | null;
  fitness_goal?: string | null;
  medical_restrictions?: string | null;
  physiotherapist_notes?: string | null;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PIXKey {
  id: string;
  key_type: string;
  key_value: string;
  recipient_name: string;
  is_primary?: boolean;
  created_at?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('Profile fetch skipped: No authenticated user');
        return null;
      }

      console.log('🔍 Profile Debug - Fetching profile for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Supabase error in profile fetch:', error);
          
          if (error.code === 'PGRST116') {
            console.log('Profile not found - this might be expected for new users');
            return null;
          }
          
          throw error;
        }

        console.log('✅ Profile fetched successfully:', data);
        return data as Profile;
      } catch (error) {
        console.error('Exception in profile fetch:', error);
        
        // Fallback to cached data if available
        const cachedData = queryClient.getQueryData<Profile>(['profile', user.id]);
        return cachedData || null;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });

  const pixKeyQuery = useQuery({
    queryKey: ['pixKey', 'primary', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('PIX key fetch skipped: No authenticated user');
        return null;
      }
      
      try {
        const { data: pixKey, error } = await supabase
          .from('pix_keys')
          .select('*')
          .eq('is_primary', true)
          .limit(1)
          .maybeSingle();
            
        console.log('🔍 PIX Key Debug - PIX key result:', { pixKey, error });
        
        if (error) {
          console.error('Error fetching PIX key:', error);
          return null;
        }
        
        return pixKey;
      } catch (error) {
        console.error('Exception fetching PIX key:', error);
        return null;
      }
    },
    enabled: !!user && !!profileQuery.data,
    staleTime: 30000,
  });

  // Simple update function for admin data
  const updateUserProfile = async (profileData: Partial<Profile>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  };

  const updateProfile = useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['profile', user?.id] });
      
      const previousProfile = queryClient.getQueryData(['profile', user?.id]);
      
      queryClient.setQueryData(['profile', user?.id], (old: Profile | null | undefined) => 
        old ? { ...old, ...variables } : null
      );
      
      return { previousProfile };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast("Perfil atualizado com sucesso!");
    },
    onError: (error, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', user?.id], context.previousProfile);
      }
      
      console.error('Profile update error:', error);
      toast("Erro ao atualizar perfil. Tente novamente.");
    },
  });

  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('Profile Images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('Profile Images')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { data: profileData, error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      return profileData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast("Foto de perfil atualizada com sucesso!");
    },
    onError: (error) => {
      console.error('Image upload error:', error);
      toast("Erro ao fazer upload da imagem. Tente novamente.");
    },
  });

  const refreshProfile = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
      queryClient.invalidateQueries({ queryKey: ['pixKey', 'primary', user?.id] }),
    ]);
  }, [queryClient, user?.id]);

  const getDisplayAvatarUrl = useCallback((avatarUrl?: string | null) => {
    if (!avatarUrl) return null;
    
    // Add cache-busting parameter if needed
    if (avatarUrl.includes('Profile%20Images')) {
      const url = new URL(avatarUrl);
      url.searchParams.set('t', Date.now().toString());
      return url.toString();
    }
    
    return avatarUrl;
  }, []);

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    uploadProfileImage: uploadProfileImage.mutate,
    isUploading: uploadProfileImage.isPending,
    pixKey: pixKeyQuery.data,
    isLoadingPixKey: pixKeyQuery.isLoading,
    refreshProfile,
    getDisplayAvatarUrl,
  };
}