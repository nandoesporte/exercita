import { useAuth } from './useAuth';
import { toast } from 'sonner';
// Removed Supabase imports - using MySQL now

type Profile = {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  birth_date?: string;
  birthdate?: string; // Alias for birth_date
  gender?: string;
  weight?: number;
  height?: number;
  fitness_goal?: string;
  created_at?: string;
  updated_at?: string;
};

type ProfileUpdate = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  birth_date?: string;
};

interface PixKey {
  id: string;
  key_type: 'cpf' | 'email' | 'phone' | 'random';
  key_value: string;
  recipient_name: string;
  is_primary: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  
  // Placeholder - profile management not yet implemented with MySQL
  return {
    profile: user ? {
      id: user.id,
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      phone: '',
      birth_date: '',
      birthdate: '', // Alias
      gender: '',
      weight: 0,
      height: 0,
      fitness_goal: '',
      created_at: user.created_at,
      updated_at: user.updated_at
    } : null,
    isLoading: false,
    error: null,
    pixKey: null,
    isLoadingPixKey: false,
    updateProfile: async (data: ProfileUpdate) => {
      toast.error('Atualização de perfil será implementada em breve');
      return { success: false, error: 'Not implemented' };
    },
    isUpdating: false,
    uploadProfileImage: async (file: File) => {
      toast.error('Upload de avatar será implementado em breve');
      return { success: false, error: 'Not implemented' };
    },
    isUploadingImage: false,
    refreshProfile: () => {
      console.log('Profile refresh will be implemented');
    },
    getDisplayAvatarUrl: (url?: string | null) => url
  };
}
