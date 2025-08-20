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
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          categoria: string | null
          chave: string
          created_at: string
          descricao: string | null
          id: string
          tipo: string | null
          updated_at: string
          valor: string | null
        }
        Insert: {
          categoria?: string | null
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string
          valor?: string | null
        }
        Update: {
          categoria?: string | null
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
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
      payment_history: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          payment_method: string
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          payment_method: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pix_keys: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          key_type: string
          key_value: string
          recipient_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          key_type: string
          key_value: string
          recipient_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          key_type?: string
          key_value?: string
          recipient_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          atualizado_em: string
          criado_em: string
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          id?: string
          nome?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      regras_resposta_automatica: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          response_text: string | null
          trigger_keywords: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          response_text?: string | null
          trigger_keywords?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          response_text?: string | null
          trigger_keywords?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      site_banners: {
        Row: {
          created_at: string
          display_order: number
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          position: string | null
          start_date: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          position?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          position?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_config: {
        Row: {
          category: string | null
          config_key: string
          config_type: string | null
          config_value: string | null
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          config_key: string
          config_type?: string | null
          config_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          config_key?: string
          config_type?: string | null
          config_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          duration: number | null
          exercise_id: string | null
          id: string
          order_index: number
          reps: number | null
          rest_time: number | null
          sets: number | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          exercise_id?: string | null
          id?: string
          order_index?: number
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          exercise_id?: string | null
          id?: string
          order_index?: number
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
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
          category_id: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration: number | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration?: number | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration?: number | null
          id?: string
          name?: string
          updated_at?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
