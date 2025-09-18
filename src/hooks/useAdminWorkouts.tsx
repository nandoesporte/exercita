// Simplified admin workouts for physiotherapy app
export function useAdminWorkouts() {
  return {
    workouts: [],
    isLoading: false,
    createWorkout: () => {},
    updateWorkout: () => {},
    deleteWorkout: () => {},
    categories: [],
    users: [],
    exercises: [],
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    getWorkoutExercises: () => ({
      data: [],
      isLoading: false
    }),
    getWorkoutDays: () => ({
      data: [],
      isLoading: false
    }),
    getWorkoutRecommendations: () => ({
      data: [],
      isLoading: false
    }),
    addWorkoutRecommendation: () => {},
    removeWorkoutRecommendation: () => {},
    addExerciseToWorkout: () => {},
    removeExerciseFromWorkout: () => {},
    updateExerciseOrder: () => {},
    cloneExercisesToDays: () => {}
  };
}