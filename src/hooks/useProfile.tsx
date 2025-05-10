
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
      if (!user) throw new Error('Usuário precisa estar logado');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw new Error(`Erro ao buscar perfil: ${error.message}`);
      }
      
      return data as Profile;
    },
    enabled: !!user,
  });
  
  const updateProfile = useMutation({
    mutationFn: async (profileData: ProfileUpdate) => {
      if (!user) throw new Error('Usuário precisa estar logado');
      
      console.log('Atualizando perfil com dados:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }
      
      console.log('Perfil atualizado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro na atualização do perfil:', error);
      toast.error(error.message || 'Falha ao atualizar o perfil');
    }
  });
  
  // Função para upload de imagem de perfil
  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuário precisa estar logado');
      
      // Gera um caminho único de arquivo com ID do usuário como prefixo
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      
      // Upload do arquivo para o armazenamento
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      // Obtém a URL pública para o arquivo carregado
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      
      // Atualiza o perfil com a nova URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar perfil com novo avatar: ${updateError.message}`);
      }
      
      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Foto de perfil atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Falha ao atualizar foto de perfil');
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
