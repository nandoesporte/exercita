import { executeQuery, executeQuerySingle, executeInsert, executeUpdate } from './mysql';
import { 
  User, 
  Workout, 
  Exercise, 
  WorkoutCategory, 
  Product, 
  Order,
  OrderItem,
  Appointment,
  PersonalTrainer,
  GymPhoto,
  WorkoutExercise,
  WorkoutDay,
  WorkoutRecommendation,
  UserWorkoutHistory,
  QueryResult,
  SingleQueryResult,
  CreateInput,
  UpdateInput
} from '../types/database';

// User operations
export const userService = {
  async getById(id: string): Promise<SingleQueryResult<User>> {
    try {
      const user = await executeQuerySingle<User>(
        'SELECT id, email, first_name, last_name, avatar_url, is_admin, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return { data: user };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getAll(): Promise<QueryResult<User>> {
    try {
      const users = await executeQuery<User>(
        'SELECT id, email, first_name, last_name, avatar_url, is_admin, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return { data: users };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async create(userData: CreateInput<User> & { password: string }): Promise<SingleQueryResult<User>> {
    try {
      const userId = await executeInsert(
        `INSERT INTO users (id, email, password, first_name, last_name, is_admin, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.email,
          userData.password,
          userData.first_name || null,
          userData.last_name || null,
          userData.is_admin || false
        ]
      );

      const user = await executeQuerySingle<User>(
        'SELECT id, email, first_name, last_name, avatar_url, is_admin, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      return { data: user };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async update(id: string, userData: UpdateInput<User>): Promise<SingleQueryResult<User>> {
    try {
      const fields = Object.keys(userData).filter(key => userData[key as keyof UpdateInput<User>] !== undefined);
      const values = fields.map(key => userData[key as keyof UpdateInput<User>]);
      
      if (fields.length === 0) {
        const user = await executeQuerySingle<User>(
          'SELECT id, email, first_name, last_name, avatar_url, is_admin, created_at, updated_at FROM users WHERE id = ?',
          [id]
        );
        return { data: user };
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await executeUpdate(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );

      const user = await executeQuerySingle<User>(
        'SELECT id, email, first_name, last_name, avatar_url, is_admin, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      return { data: user };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await executeUpdate('DELETE FROM users WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Workout operations
export const workoutService = {
  async getAll(): Promise<QueryResult<Workout>> {
    try {
      const workouts = await executeQuery<Workout & { category_name?: string; category_icon?: string; category_color?: string }>(
        `SELECT w.*, wc.name as category_name, wc.icon as category_icon, wc.color as category_color
         FROM workouts w
         LEFT JOIN workout_categories wc ON w.category_id = wc.id
         ORDER BY w.created_at DESC`
      );

      // Transform the data to include nested category object
      const transformedWorkouts = workouts.map(workout => ({
        ...workout,
        category: workout.category_name ? {
          id: workout.category_id || '',
          name: workout.category_name,
          icon: workout.category_icon,
          color: workout.category_color
        } : null
      }));

      return { data: transformedWorkouts };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getById(id: string): Promise<SingleQueryResult<Workout>> {
    try {
      const workout = await executeQuerySingle<Workout & { category_name?: string; category_icon?: string; category_color?: string }>(
        `SELECT w.*, wc.name as category_name, wc.icon as category_icon, wc.color as category_color
         FROM workouts w
         LEFT JOIN workout_categories wc ON w.category_id = wc.id
         WHERE w.id = ?`,
        [id]
      );

      if (!workout) {
        return { data: null, error: 'Workout not found' };
      }

      // Get workout exercises
      const exercises = await executeQuery<WorkoutExercise & { exercise_name?: string; exercise_description?: string; exercise_image_url?: string; exercise_video_url?: string }>(
        `SELECT we.*, e.name as exercise_name, e.description as exercise_description, 
                e.image_url as exercise_image_url, e.video_url as exercise_video_url
         FROM workout_exercises we
         LEFT JOIN exercises e ON we.exercise_id = e.id
         WHERE we.workout_id = ?
         ORDER BY we.order_position`,
        [id]
      );

      // Get workout days
      const days = await executeQuery<WorkoutDay>(
        'SELECT * FROM workout_days WHERE workout_id = ?',
        [id]
      );

      const transformedWorkout = {
        ...workout,
        category: workout.category_name ? {
          id: workout.category_id || '',
          name: workout.category_name,
          icon: workout.category_icon,
          color: workout.category_color
        } : null,
        exercises: exercises.map(ex => ({
          ...ex,
          exercise: ex.exercise_name ? {
            id: ex.exercise_id || '',
            name: ex.exercise_name,
            description: ex.exercise_description,
            image_url: ex.exercise_image_url,
            video_url: ex.exercise_video_url
          } : null
        })),
        days_of_week: days.map(d => d.day_of_week)
      };

      return { data: transformedWorkout };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async create(workoutData: CreateInput<Workout>): Promise<SingleQueryResult<Workout>> {
    try {
      const workoutId = await executeInsert(
        `INSERT INTO workouts (id, title, description, category_id, difficulty_level, duration_minutes, is_recommended, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          workoutData.title,
          workoutData.description || null,
          workoutData.category_id || null,
          workoutData.difficulty_level || 'beginner',
          workoutData.duration_minutes || null,
          workoutData.is_recommended || false
        ]
      );

      const { data: workout } = await this.getById(workoutId.toString());
      return { data: workout };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async update(id: string, workoutData: UpdateInput<Workout>): Promise<SingleQueryResult<Workout>> {
    try {
      const fields = Object.keys(workoutData).filter(key => workoutData[key as keyof UpdateInput<Workout>] !== undefined);
      const values = fields.map(key => workoutData[key as keyof UpdateInput<Workout>]);
      
      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        await executeUpdate(
          `UPDATE workouts SET ${setClause}, updated_at = NOW() WHERE id = ?`,
          [...values, id]
        );
      }

      const { data: workout } = await this.getById(id);
      return { data: workout };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete related records first
      await executeUpdate('DELETE FROM workout_exercises WHERE workout_id = ?', [id]);
      await executeUpdate('DELETE FROM workout_days WHERE workout_id = ?', [id]);
      await executeUpdate('DELETE FROM workout_recommendations WHERE workout_id = ?', [id]);
      await executeUpdate('DELETE FROM user_workout_history WHERE workout_id = ?', [id]);
      
      // Delete the workout
      await executeUpdate('DELETE FROM workouts WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Exercise operations
export const exerciseService = {
  async getAll(): Promise<QueryResult<Exercise>> {
    try {
      const exercises = await executeQuery<Exercise>(
        'SELECT * FROM exercises ORDER BY name'
      );
      return { data: exercises };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getById(id: string): Promise<SingleQueryResult<Exercise>> {
    try {
      const exercise = await executeQuerySingle<Exercise>(
        'SELECT * FROM exercises WHERE id = ?',
        [id]
      );
      return { data: exercise };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async create(exerciseData: CreateInput<Exercise>): Promise<SingleQueryResult<Exercise>> {
    try {
      const exerciseId = await executeInsert(
        `INSERT INTO exercises (id, name, description, image_url, video_url, category_id, muscle_groups, equipment, difficulty_level, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          exerciseData.name,
          exerciseData.description || null,
          exerciseData.image_url || null,
          exerciseData.video_url || null,
          exerciseData.category_id || null,
          exerciseData.muscle_groups ? JSON.stringify(exerciseData.muscle_groups) : null,
          exerciseData.equipment ? JSON.stringify(exerciseData.equipment) : null,
          exerciseData.difficulty_level || 'beginner'
        ]
      );

      const { data: exercise } = await this.getById(exerciseId.toString());
      return { data: exercise };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async update(id: string, exerciseData: UpdateInput<Exercise>): Promise<SingleQueryResult<Exercise>> {
    try {
      const fields = Object.keys(exerciseData).filter(key => exerciseData[key as keyof UpdateInput<Exercise>] !== undefined);
      const values = fields.map(key => {
        const value = exerciseData[key as keyof UpdateInput<Exercise>];
        if (key === 'muscle_groups' || key === 'equipment') {
          return Array.isArray(value) ? JSON.stringify(value) : value;
        }
        return value;
      });
      
      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        await executeUpdate(
          `UPDATE exercises SET ${setClause}, updated_at = NOW() WHERE id = ?`,
          [...values, id]
        );
      }

      const { data: exercise } = await this.getById(id);
      return { data: exercise };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete related workout exercises first
      await executeUpdate('DELETE FROM workout_exercises WHERE exercise_id = ?', [id]);
      
      // Delete the exercise
      await executeUpdate('DELETE FROM exercises WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Workout category operations
export const categoryService = {
  async getAll(): Promise<QueryResult<WorkoutCategory>> {
    try {
      const categories = await executeQuery<WorkoutCategory>(
        'SELECT * FROM workout_categories ORDER BY name'
      );
      return { data: categories };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getById(id: string): Promise<SingleQueryResult<WorkoutCategory>> {
    try {
      const category = await executeQuerySingle<WorkoutCategory>(
        'SELECT * FROM workout_categories WHERE id = ?',
        [id]
      );
      return { data: category };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async create(categoryData: CreateInput<WorkoutCategory>): Promise<SingleQueryResult<WorkoutCategory>> {
    try {
      const categoryId = await executeInsert(
        `INSERT INTO workout_categories (id, name, icon, color, description, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())`,
        [
          categoryData.name,
          categoryData.icon || null,
          categoryData.color || null,
          categoryData.description || null
        ]
      );

      const { data: category } = await this.getById(categoryId.toString());
      return { data: category };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
};