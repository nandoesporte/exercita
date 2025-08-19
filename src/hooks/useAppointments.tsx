
import { useState } from 'react';
import { useAuth } from './useAuth';
// Removed Supabase imports - using MySQL now

export function useAppointments() {
  const { user } = useAuth();
  
  // Placeholder - appointments not yet implemented with MySQL
  return {
    data: { upcoming: [], past: [] },
    isLoading: false,
    error: null
  };
}
