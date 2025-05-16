
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
    console.error("Erro ao buscar histórico de treinos:", error);
    throw new Error("Falha ao carregar histórico de treinos");
  }
  
  // Transform the data to match the expected format
  // Supabase returns workout and category as arrays due to the nested select
  // We need to convert them to single objects to match our type definition
  const formattedData = data?.map(item => {
    // Extract the workout from the array
    const workoutData = Array.isArray(item.workout) && item.workout.length > 0 
      ? item.workout[0] 
      : { 
          id: item.workout_id, 
          title: 'Unknown Workout', 
          level: 'beginner', 
          duration: 0, 
          calories: 0, 
          image_url: null, 
          category_id: null 
        };
    
    // Extract the category if it exists
    const categoryData = Array.isArray(workoutData.category) && workoutData.category.length > 0 
      ? workoutData.category[0] 
      : undefined;
    
    // Return a properly formatted item
    return {
      ...item,
      workout: {
        ...workoutData,
        category: categoryData
      }
    };
  }) || [];
  
  return formattedData as WorkoutHistoryItem[];
};

export const useWorkoutHistory = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["workoutHistory"],
    queryFn: fetchWorkoutHistory,
    refetchOnWindowFocus: false,
  });
};
