export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          status: string
          title: string
          trainer_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          status?: string
          title: string
          trainer_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          status?: string
          title?: string
          trainer_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "workout_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          created_at: string | null
          first_name: string | null
          fitness_goal: string | null
          gender: string | null
          height: number | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          first_name?: string | null
          fitness_goal?: string | null
          gender?: string | null
          height?: number | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          first_name?: string | null
          fitness_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      user_workout_history: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          duration: number | null
          id: string
          notes: string | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
          workout_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_history_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          duration: number | null
          exercise_id: string | null
          id: string
          order_position: number
          reps: number | null
          rest: number | null
          sets: number | null
          updated_at: string | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          exercise_id?: string | null
          id?: string
          order_position: number
          reps?: number | null
          rest?: number | null
          sets?: number | null
          updated_at?: string | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          exercise_id?: string | null
          id?: string
          order_position?: number
          reps?: number | null
          rest?: number | null
          sets?: number | null
          updated_at?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image_url: string | null
          is_featured: boolean | null
          level: Database["public"]["Enums"]["difficulty_level"]
          title: string
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          level: Database["public"]["Enums"]["difficulty_level"]
          title: string
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          level?: Database["public"]["Enums"]["difficulty_level"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "workout_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced" | "all_levels"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["beginner", "intermediate", "advanced", "all_levels"],
    },
  },
} as const
