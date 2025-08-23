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
      // Get all users data using the function
      const { data: usersData, error: usersError } = await supabase.rpc('get_all_users');
      
      if (usersError) throw usersError;

      // Get profiles data
      let profilesQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, admin_id, created_at, avatar_url');

      // If not super admin, filter by admin_id
      if (isAdmin && !isSuperAdmin) {
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('admin_id')
            .eq('id', currentUser.user.id)
            .single();

          if (currentProfile?.admin_id) {
            profilesQuery = profilesQuery.eq('admin_id', currentProfile.admin_id);
          }
        }
      }

      const { data: profiles, error: profilesError } = await profilesQuery;

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