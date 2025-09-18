// Simplified exercise categories for physiotherapy app
export function useExerciseCategories() {
  return {
    categories: [],
    isLoading: false,
    refetch: () => Promise.resolve()
  };
}