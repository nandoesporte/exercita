import { useAuth } from './useAuth';
import { toast } from 'sonner';
// Removed Supabase imports - using MySQL now

export type AdminWorkout = {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  level?: 'beginner' | 'intermediate' | 'advanced'; // Alias for difficulty_level
  duration_minutes?: number;
  duration?: number; // Alias for duration_minutes
  calories?: number;
  image_url?: string;
  is_recommended?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  days_of_week?: string[] | null;
};

export type WorkoutFormData = {
  title: string;
  description?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category_id?: string | null;
  image_url?: string | null;
  calories?: number | null;
  user_id?: string | null; 
  days_of_week?: string[] | null;
  is_recommended?: boolean;
};

export type UpdateWorkoutData = WorkoutFormData & {
  id: string;
};

export type WorkoutExercise = {
  exercise_id?: string;
  sets?: number;
  reps?: number | null;
  duration?: number | null;
  rest?: number | null;
  weight?: number | null;
  order_position: number;
  day_of_week?: string | null;
  is_title_section?: boolean;
  section_title?: string | null;
};

export type WorkoutRecommendation = {
  id?: string;
  workout_id: string;
  user_id: string | null; // null means recommended for all users
};

export function useAdminWorkouts() {
  const { user } = useAuth();
  
  // Placeholder - admin workouts not yet implemented with MySQL
  return {
    workouts: [],
    isLoading: false,
    error: null,
    isUpdating: false,
    isDeleting: false,
    isCreating: false,
    categories: [],
    areCategoriesLoading: false,
    users: [],
    areUsersLoading: false,
    exercises: [],
    areExercisesLoading: false,
    createWorkout: async () => {
      toast.error('Criação de treinos será implementada em breve');
      return null;
    },
    updateWorkout: async () => {
      toast.error('Atualização de treinos será implementada em breve');
      return null;
    },
    deleteWorkout: async () => {
      toast.error('Exclusão de treinos será implementada em breve');
    },
    cloneWorkout: async () => {
      toast.error('Clonagem de treinos será implementada em breve');
      return null;
    },
    getWorkoutExercises: () => ({
      data: [],
      isLoading: false,
      error: null
    }),
    getWorkoutDays: () => ({
      data: [],
      isLoading: false,
      error: null
    }),
    getWorkoutRecommendations: () => ({
      data: [],
      isLoading: false,
      error: null
    }),
    addWorkoutRecommendation: async () => {
      toast.error('Recomendações serão implementadas em breve');
    },
    isAddingRecommendation: false,
    removeWorkoutRecommendation: async () => {
      toast.error('Remoção de recomendações será implementada em breve');
    },
    isRemovingRecommendation: false,
    addExerciseToWorkout: async () => {
      toast.error('Adição de exercícios será implementada em breve');
    },
    isAddingExercise: false,
    removeExerciseFromWorkout: async () => {
      toast.error('Remoção de exercícios será implementada em breve');
    },
    isRemovingExercise: false,
    updateExerciseOrder: async () => {
      toast.error('Reordenação será implementada em breve');
    },
    isUpdatingExerciseOrder: false,
    cloneExercisesToDays: async () => {
      toast.error('Clonagem de exercícios será implementada em breve');
    },
    isCloningExercises: false
  };
}
