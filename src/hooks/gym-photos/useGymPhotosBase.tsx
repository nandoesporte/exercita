
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type GymPhoto = {
  id: string;
  photo_url: string;
  description: string | null;
  created_at: string;
  approved: boolean;
  user_id: string;
  processed_by_ai: boolean;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
};

export type PhotoAnalysis = {
  id: string;
  photo_id: string;
  equipment_detected: any;
  analysis_date: string;
};

export function useGymPhotosBase() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);

  return {
    user,
    queryClient,
    analyzing,
    setAnalyzing,
    supabase
  };
}
