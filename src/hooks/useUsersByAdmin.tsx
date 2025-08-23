import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  admin_id: string | null;
  created_at: string;
  avatar_url: string | null;
  email?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  userCount: number;
}

export function useUsersByAdmin() {
  const { isSuperAdmin, isAdmin } = useAdminRole();

  const { data: adminUsers, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: admins, error } = await supabase
        .from('admins')
        .select('id, name, email')
        .eq('status', 'active');

      if (error) throw error;

      return admins as AdminUser[];
    },
    enabled: isSuperAdmin,
  });

  const { data: userProfiles, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-by-admin'],
    queryFn: async () => {
      if (isSuperAdmin) {
        // Super admin gets all users with email data
        const { data: usersData, error: usersError } = await supabase.rpc('get_all_users');
        if (usersError) throw usersError;

        // Get all profiles data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url');

        if (profilesError) throw profilesError;

        // Combine users and profiles data
        const combinedData = profiles.map(profile => {
          const userData = usersData.find((u: any) => u.id === profile.id);
          return {
            ...profile,
            email: userData?.email || null
          };
        });

        return combinedData as UserProfile[];
      } else if (isAdmin) {
        // Regular admin gets only their users (no email access for security)
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error('Usuário não autenticado');
        
        // Get current admin ID
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('admin_id')
          .eq('id', currentUser.user.id)
          .single();

        if (!currentProfile?.admin_id) {
          throw new Error('Admin ID não encontrado');
        }

        // Get only profiles for this admin
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url')
          .eq('admin_id', currentProfile.admin_id)
          .neq('is_admin', true); // Exclude other admins from the list

        if (profilesError) throw profilesError;

        // For regular admins, we don't expose email addresses for security
        return profiles.map(profile => ({
          ...profile,
          email: `${profile.first_name || 'usuário'}@***` // Masked email
        })) as UserProfile[];
      }
      
      return [];
    },
    enabled: isSuperAdmin || isAdmin,
  });

  const getUsersByAdmin = (adminId?: string) => {
    if (!userProfiles) return [];
    
    if (adminId) {
      return userProfiles.filter(user => user.admin_id === adminId);
    }
    
    return userProfiles;
  };

  const getAdminsWithUserCount = () => {
    if (!adminUsers || !userProfiles) return [];
    
    return adminUsers.map(admin => ({
      ...admin,
      userCount: userProfiles.filter(user => user.admin_id === admin.id).length
    }));
  };

  return {
    adminUsers: getAdminsWithUserCount(),
    userProfiles,
    getUsersByAdmin,
    isLoading: isLoadingAdmins || isLoadingUsers,
    isSuperAdmin,
    isAdmin
  };
}