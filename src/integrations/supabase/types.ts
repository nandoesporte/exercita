export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
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
      equipment_based_workouts: {
        Row: {
          available_time: number | null
          created_at: string
          equipment_list: Json | null
          fitness_goal: string | null
          fitness_level: string | null
          id: string
          photo_analysis_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_time?: number | null
          created_at?: string
          equipment_list?: Json | null
          fitness_goal?: string | null
          fitness_level?: string | null
          id?: string
          photo_analysis_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_time?: number | null
          created_at?: string
          equipment_list?: Json | null
          fitness_goal?: string | null
          fitness_level?: string | null
          id?: string
          photo_analysis_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_based_workouts_photo_analysis_id_fkey"
            columns: ["photo_analysis_id"]
            isOneToOne: false
            referencedRelation: "gym_photo_analysis"
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
      gym_photo_analysis: {
        Row: {
          analysis_date: string
          equipment_detected: Json | null
          id: string
          photo_id: string
        }
        Insert: {
          analysis_date?: string
          equipment_detected?: Json | null
          id?: string
          photo_id: string
        }
        Update: {
          analysis_date?: string
          equipment_detected?: Json | null
          id?: string
          photo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_photo_analysis_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "user_gym_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          kiwify_order_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          accept_card_payments: boolean | null
          accept_monthly_fee: boolean | null
          accept_pix_payments: boolean | null
          created_at: string | null
          id: string
          monthly_fee_amount: number | null
          updated_at: string | null
        }
        Insert: {
          accept_card_payments?: boolean | null
          accept_monthly_fee?: boolean | null
          accept_pix_payments?: boolean | null
          created_at?: string | null
          id?: string
          monthly_fee_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          accept_card_payments?: boolean | null
          accept_monthly_fee?: boolean | null
          accept_pix_payments?: boolean | null
          created_at?: string | null
          id?: string
          monthly_fee_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      personal_trainers: {
        Row: {
          bio: string | null
          created_at: string | null
          credentials: string | null
          id: string
          is_primary: boolean | null
          name: string
          photo_url: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          credentials?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          photo_url?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          credentials?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          photo_url?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      pix_keys: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          key_type: string
          key_value: string
          recipient_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          key_type: string
          key_value: string
          recipient_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          key_type?: string
          key_value?: string
          recipient_name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          sale_url: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          sale_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          sale_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
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
      user_gym_photos: {
        Row: {
          approved: boolean | null
          created_at: string | null
          description: string | null
          id: string
          photo_url: string
          processed_by_ai: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          photo_url: string
          processed_by_ai?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          photo_url?: string
          processed_by_ai?: boolean | null
          updated_at?: string | null
          user_id?: string
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
      workout_clone_history: {
        Row: {
          cloned_by_user_id: string | null
          cloned_workout_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          source_workout_id: string
          status: string
          target_user_id: string
        }
        Insert: {
          cloned_by_user_id?: string | null
          cloned_workout_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          source_workout_id: string
          status?: string
          target_user_id: string
        }
        Update: {
          cloned_by_user_id?: string | null
          cloned_workout_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          source_workout_id?: string
          status?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_clone_history_cloned_workout_id_fkey"
            columns: ["cloned_workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_clone_history_source_workout_id_fkey"
            columns: ["source_workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_days: {
        Row: {
          created_at: string | null
          day_of_week: string
          id: string
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          id?: string
          workout_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          day_of_week: string | null
          duration: number | null
          exercise_id: string | null
          id: string
          is_title_section: boolean | null
          order_position: number
          reps: number | null
          rest: number | null
          section_title: string | null
          sets: number | null
          updated_at: string | null
          weight: number | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: string | null
          duration?: number | null
          exercise_id?: string | null
          id?: string
          is_title_section?: boolean | null
          order_position: number
          reps?: number | null
          rest?: number | null
          section_title?: string | null
          sets?: number | null
          updated_at?: string | null
          weight?: number | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string | null
          duration?: number | null
          exercise_id?: string | null
          id?: string
          is_title_section?: boolean | null
          order_position?: number
          reps?: number | null
          rest?: number | null
          section_title?: string | null
          sets?: number | null
          updated_at?: string | null
          weight?: number | null
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
      workout_recommendations: {
        Row: {
          created_at: string | null
          id: string
          user_id: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_recommendations_workout_id_fkey"
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
          is_recommended: boolean | null
          level: Database["public"]["Enums"]["workout_level"]
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
          is_recommended?: boolean | null
          level: Database["public"]["Enums"]["workout_level"]
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
          is_recommended?: boolean | null
          level?: Database["public"]["Enums"]["workout_level"]
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
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      workout_level: "beginner" | "intermediate" | "advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      workout_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
