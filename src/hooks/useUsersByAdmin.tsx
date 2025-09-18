// Simplified user management for physiotherapy app
export function useUsersByAdmin() {
  return {
    usersByAdmin: [],
    adminUsers: [], // Add for compatibility
    isLoading: false,
    error: null,
    refetch: () => {},
    getUsersByAdmin: (_adminId?: string) => [] as any[], // Return empty array
    isSuperAdmin: false,
    isAdmin: false,
    userProfiles: []
  };
}