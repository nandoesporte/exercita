
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type Appointment = Database['public']['Tables']['appointments']['Row'];

export function useAppointments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }
      
      const now = new Date();
      const upcoming = data.filter(
        appointment => new Date(appointment.appointment_date) >= now
      );
      
      const past = data.filter(
        appointment => new Date(appointment.appointment_date) < now
      );
      
      return { upcoming, past };
    },
    enabled: !!user,
  });
}
