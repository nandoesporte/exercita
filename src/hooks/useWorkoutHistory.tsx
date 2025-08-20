
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WorkoutHistoryItem = {
  id: string;
  user_id: string;
  workout_id: string;
  workout: {
    id: string;
    title: string;
    level: string;
    duration: number;
    calories: number;
    image_url: string | null;
    category_id: string | null;
    category?: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  completed_at: string;
  duration: number | null;
  calories_burned: number | null;
  rating: number | null;
  notes: string | null;
};

export const fetchWorkoutHistory = async (): Promise<WorkoutHistoryItem[]> => {
  // Workout history functionality disabled - table doesn't exist
  console.log("Workout history functionality disabled - user_workout_history table doesn't exist");
  return [];
};

// Function to fetch the user's personalized workout
export const fetchUserPersonalizedWorkout = async (): Promise<string | null> => {
  // Personalized workout functionality disabled - required tables don't exist
  console.log("Personalized workout functionality disabled - workout_recommendations table doesn't exist");
  return null;
};

export const useWorkoutHistory = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["workoutHistory"],
    queryFn: fetchWorkoutHistory,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserPersonalizedWorkout = () => {
  return useQuery({
    queryKey: ["userPersonalizedWorkout"],
    queryFn: fetchUserPersonalizedWorkout,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
