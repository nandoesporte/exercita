import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/lib/database';
import { Workout } from '@/types/database';

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data, error } = await workoutService.getAll();
      
      if (error) {
        throw new Error(`Error fetching workouts: ${error}`);
      }
      
      return data as Workout[];
    },
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: async () => {
      if (!id) throw new Error('Workout ID is required');
      
      const { data, error } = await workoutService.getById(id);
      
      if (error) {
        throw new Error(`Error fetching workout: ${error}`);
      }

      if (!data) {
        throw new Error('Workout not found');
      }
      
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useWorkoutsByDay(day: string | null) {
  return useQuery({
    queryKey: ['workouts-by-day', day],
    queryFn: async () => {
      const { data, error } = await workoutService.getAll();
      
      if (error) {
        throw new Error(`Error fetching workouts: ${error}`);
      }
      
      if (!day) {
        return data as Workout[];
      }
      
      // Filter workouts by day
      const filteredWorkouts = data.filter(workout => 
        workout.days_of_week && workout.days_of_week.includes(day)
      );
      
      return filteredWorkouts as Workout[];
    },
    enabled: true,
  });
}

export function useWorkoutCategories() {
  return useQuery({
    queryKey: ['workout-categories'],
    queryFn: async () => {
      // Import categoryService here to avoid circular dependencies
      const { categoryService } = await import('@/lib/database');
      const { data, error } = await categoryService.getAll();
      
      if (error) {
        throw new Error(`Error fetching workout categories: ${error}`);
      }
      
      return data;
    },
  });
}

export function useRecommendedWorkoutsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['recommended-workouts-for-user', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided to useRecommendedWorkoutsForUser, returning empty array');
        return [];
      }
      
      console.log(`Fetching recommended workouts for user: ${userId}`);
      
      const { data, error } = await workoutService.getAll();
      
      if (error) {
        console.error("Error fetching workouts:", error);
        return [];
      }
      
      // For now, return all recommended workouts
      // TODO: Implement user-specific recommendations in the database service
      const recommendedWorkouts = data.filter(workout => workout.is_recommended);
      
      console.log(`Found ${recommendedWorkouts.length} recommended workouts for user ${userId}`);
      
      return recommendedWorkouts as Workout[];
    },
    enabled: !!userId,
  });
}