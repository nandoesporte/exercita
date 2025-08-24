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
    queryKey: ['users-by-admin', isSuperAdmin ? 'all' : adminData?.id],
    queryFn: async () => {
      console.log('Fetching users - isSuperAdmin:', isSuperAdmin, 'adminData:', adminData);
      
      if (isSuperAdmin) {
        // Super admin gets all non-admin users
        console.log('Super admin: fetching all non-admin users');
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url, is_admin')
          .eq('is_admin', false); // Only non-admin users

        console.log('Super admin - profiles:', profiles, 'error:', profilesError);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // For super admin, try to get emails via RPC, but don't fail if it doesn't work
        try {
          const { data: usersData, error: usersError } = await supabase.rpc('get_all_users');
          
          if (!usersError && usersData) {
            const usersArray = Array.isArray(usersData) ? usersData : [usersData];
            const combinedData = profiles?.map(profile => {
              const userData = usersArray?.find((u: any) => u.id === profile.id);
              return {
                ...profile,
                email: (userData as any)?.email || `${profile.first_name || 'user'}@***`
              };
            }) || [];

            console.log('Super admin - combinedData with emails:', combinedData);
            return combinedData as UserProfile[];
          }
        } catch (error) {
          console.warn('Could not fetch emails for super admin, showing profiles only:', error);
        }

        // Fallback: show all profiles without real emails
        const result = (profiles || []).map(profile => ({
          ...profile,
          email: `${profile.first_name || 'user'}@***`
        })) as UserProfile[];

        console.log('Super admin - fallback result:', result);
        return result;
        
      } else if (isAdmin && adminData?.id) {
        // Regular admin gets only their users (no email access for security)
        console.log('Regular admin: fetching users for admin_id:', adminData.id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url')
          .eq('admin_id', adminData.id)
          .eq('is_admin', false); // Only non-admin users

        if (profilesError) throw profilesError;

        console.log('Regular admin - fetched profiles:', profiles?.length || 0, 'profiles');
        
        return (profiles || []).map(profile => ({
          ...profile,
          email: `${profile.first_name || 'usuário'}@***` // Masked email
        })) as UserProfile[];
      }
      
      return [];
    },
    enabled: (isSuperAdmin || (isAdmin && !!adminData?.id)),
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