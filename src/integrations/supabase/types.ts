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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          photo_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          photo_url?: string
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
          is_recommended?: boolean | null
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
          is_recommended?: boolean | null
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
      admin_create_user: {
        Args: {
          user_email: string
          user_password: string
          user_metadata?: Json
        }
        Returns: string
      }
      admin_delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          raw_user_meta_data: Json
          created_at: string
          last_sign_in_at: string
          banned_until: string
        }[]
      }
      handle_kiwify_webhook: {
        Args: { payload: Json }
        Returns: Json
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      toggle_user_active_status: {
        Args: { user_id: string; is_active: boolean }
        Returns: undefined
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
