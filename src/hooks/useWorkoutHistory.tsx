
import { useQuery } from "@tanstack/react-query";
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
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from("user_workout_history")
    .select(`
      id,
      user_id,
      workout_id,
      workout:workouts (
        id,
        title,
        level,
        duration,
        calories,
        image_url,
        category_id,
        category:workout_categories (
          id,
          name,
          color
        )
      ),
      completed_at,
      duration,
      calories_burned,
      rating,
      notes
    `)
    .eq("user_id", user.user.id)
    .order("completed_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching workout history:", error);
    throw new Error("Falha ao carregar histórico de treinos");
  }
  
  return data || [];
};

export const useWorkoutHistory = () => {
  return useQuery({
    queryKey: ["workoutHistory"],
    queryFn: fetchWorkoutHistory,
  });
};
