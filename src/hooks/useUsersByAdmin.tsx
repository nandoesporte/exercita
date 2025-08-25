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
  is_admin: boolean;
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

  // Fetch current admin ID first
  const { data: adminData } = useQuery({
    queryKey: ['current-admin-id'],
    queryFn: async () => {
      if (isSuperAdmin || !isAdmin) return null;
      
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return null;
      
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', currentUser.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching admin ID:', error);
        return null;
      }
      
      return data;
    },
    enabled: isAdmin && !isSuperAdmin,
  });

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
    queryKey: ['users-by-admin', 'v2', isSuperAdmin ? 'all' : adminData?.id], // Versão para forçar refresh
    queryFn: async () => {
      console.log('useUsersByAdmin: Fetching users - isSuperAdmin:', isSuperAdmin, 'adminData:', adminData);
      
      if (isSuperAdmin) {
        // Super admin gets all users with email data
        const { data: usersData, error: usersError } = await supabase.rpc('get_all_users');
        if (usersError) {
          console.error('useUsersByAdmin: Error fetching users:', usersError);
          throw usersError;
        }

        console.log('useUsersByAdmin: Raw users data from RPC:', usersData);

        if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
          console.log('useUsersByAdmin: No users found, returning empty array');
          return [];
        }

        // Get all profiles data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url, is_admin');

        if (profilesError) {
          console.error('useUsersByAdmin: Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log('useUsersByAdmin: Profiles from DB:', profiles?.length, 'profiles');

        if (!profiles || profiles.length === 0) {
          console.log('useUsersByAdmin: No profiles found, returning empty array');
          return [];
        }

        // Combine users and profiles data
        const combinedData = (profiles || []).map(profile => {
          const userData = (usersData as any[])?.find((u: any) => u.id === profile.id);
          return {
            ...profile,
            email: userData?.email || `${profile.first_name || 'usuário'}@***`
          };
        });

        console.log('useUsersByAdmin: Combined data:', combinedData.length, 'users');
        return combinedData as UserProfile[];
      } else if (isAdmin && adminData?.id) {
        // Regular admin gets only their users (no email access for security)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url, is_admin')
          .eq('admin_id', adminData.id)
          .eq('is_admin', false); // Only show regular users, not other admins

        if (profilesError) {
          console.error('useUsersByAdmin: Error fetching profiles for admin:', profilesError);
          throw profilesError;
        }

        console.log('useUsersByAdmin: Fetched profiles for admin:', profiles?.length, 'profiles');
        
        if (!profiles || profiles.length === 0) {
          console.log('useUsersByAdmin: Admin has no users, returning empty array');
          return [];
        }
        
        // For regular admins, we don't expose email addresses for security
        return (profiles || []).map(profile => ({
          ...profile,
          email: `${profile.first_name || 'usuário'}@***` // Masked email
        })) as UserProfile[];
      }
      
      console.log('useUsersByAdmin: No valid conditions met, returning empty array');
      return [];
    },
    enabled: isSuperAdmin || (isAdmin && !!adminData?.id),
    staleTime: 0, // Força recarregamento
    gcTime: 0, // Não manter cache
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