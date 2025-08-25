import React from 'react';
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
  is_admin?: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  userCount: number;
}

interface RpcUserData {
  id: string;
  email: string;
  raw_user_meta_data: any;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
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

  const { data: userProfiles, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users-by-admin', isSuperAdmin ? 'all' : adminData?.id],
    queryFn: async () => {
      console.log('Fetching users - isSuperAdmin:', isSuperAdmin, 'adminData:', adminData);
      
      if (isSuperAdmin) {
        // Super admin: get all users (including admins for management)
        console.log('Super admin: fetching all users');
        
        // Get all user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, admin_id, created_at, avatar_url, is_admin');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log('Super admin - profiles found:', profiles?.length || 0);

        // Try to get emails via RPC
        try {
          const { data: usersWithEmails, error: rpcError } = await supabase.rpc('get_all_users');
          
          console.log('RPC get_all_users result:', { data: usersWithEmails, error: rpcError });
          
          if (!rpcError && usersWithEmails && Array.isArray(usersWithEmails)) {
            // Combine profile data with email data
            const combinedData = profiles?.map(profile => {
              const userWithEmail = usersWithEmails.find((u: any) => u.id === profile.id) as unknown as RpcUserData;
              return {
                ...profile,
                email: userWithEmail?.email || `${profile.first_name || 'user'}@***`
              };
            }) || [];

            console.log('Super admin - combined data with emails:', combinedData.length);
            return combinedData as UserProfile[];
          } else {
            console.warn('RPC failed or returned invalid data, using fallback:', rpcError);
          }
        } catch (error) {
          console.warn('RPC call failed, using fallback:', error);
        }

        // Fallback: return profiles with masked emails
        const fallbackResult = (profiles || []).map(profile => ({
          ...profile,
          email: `${profile.first_name || 'usuário'}@***`
        })) as UserProfile[];

        console.log('Super admin - fallback result:', fallbackResult.length, 'users');
        return fallbackResult;
        
      } else if (isAdmin && adminData?.id) {
        // Regular admin gets only their non-admin users
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
    enabled: isSuperAdmin || (isAdmin && !!adminData?.id),
    retry: 3,
    staleTime: 0, // Always refetch
  });

  // Add logging for debugging
  React.useEffect(() => {
    console.log('useUsersByAdmin hook state:', {
      isSuperAdmin,
      isAdmin,
      adminData,
      enabled: isSuperAdmin || (isAdmin && !!adminData?.id),
      userProfiles: userProfiles?.length || 0,
      isLoading: isLoadingUsers,
      error: usersError
    });
  }, [isSuperAdmin, isAdmin, adminData, userProfiles, isLoadingUsers, usersError]);

  const getUsersByAdmin = (adminId?: string) => {
    if (!userProfiles) return [];
    
    if (adminId) {
      return userProfiles.filter(user => user.admin_id === adminId);
    }
    
    return userProfiles;
  };

  const getRegularUsers = () => {
    if (!userProfiles) return [];
    return userProfiles.filter(user => !user.is_admin);
  };

  const getAdminUsers = () => {
    if (!userProfiles) return [];
    return userProfiles.filter(user => user.is_admin);
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
    getRegularUsers,
    getAdminUsers,
    isLoading: isLoadingAdmins || isLoadingUsers,
    isSuperAdmin,
    isAdmin
  };
}