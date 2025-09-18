// Simplified admin workouts for physiotherapy app

// Export types needed by components
export interface WorkoutFormData {
  title: string;
  description?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  category_id?: string | null;
  calories?: number | null;
  user_id?: string;
  days_of_week?: string[];
}

export interface WorkoutExercise {
  id?: string;
  workout_id?: string;
  exercise_id?: string;
  sets?: number;
  reps?: number | null;
  duration?: number | null;
  rest?: number | null;
  weight?: number | null;
  order_position?: number;
  day_of_week?: string;
  is_title_section?: boolean;
  section_title?: string;
}

export function useAdminWorkouts() {
  return {
    workouts: [],
    isLoading: false,
    createWorkout: (_data?: WorkoutFormData, _toast?: boolean) => Promise.resolve(),
    updateWorkout: (_data?: any) => Promise.resolve(),
    deleteWorkout: (_id?: string) => Promise.resolve(),
    categories: [],
    users: [],
    exercises: [],
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    areCategoriesLoading: false,
    areUsersLoading: false,
    areExercisesLoading: false,
    isAddingExercise: false,
    isRemovingExercise: false,
    isUpdatingExerciseOrder: false,
    isCloningExercises: false,
    isAddingRecommendation: false,
    isRemovingRecommendation: false,
    getWorkoutExercises: (_workoutId?: string, _dayOfWeek?: string) => ({
      data: [],
      isLoading: false
    }),
    getWorkoutDays: (_workoutId?: string) => ({
      data: [],
      isLoading: false
    }),
    getWorkoutRecommendations: (_workoutId?: string) => ({
      data: [],
      isLoading: false
    }),
    addWorkoutRecommendation: (_data?: any) => Promise.resolve(),
    removeWorkoutRecommendation: (_data?: any) => Promise.resolve(),
    addExerciseToWorkout: (_exerciseData?: WorkoutExercise) => Promise.resolve(),
    removeExerciseFromWorkout: (_exerciseId?: string) => Promise.resolve(),
    updateExerciseOrder: (_exerciseId?: string) => Promise.resolve(),
    cloneExercisesToDays: (_data?: any) => Promise.resolve()
  };
}