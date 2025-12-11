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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_routines: {
        Row: {
          created_at: string
          day_of_week: number
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          routine_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          routine_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          routine_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          equipment: string | null
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          id: string
          image_url: string | null
          instructions: string[] | null
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment?: string | null
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment?: string | null
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          muscle_group?: Database["public"]["Enums"]["muscle_group"]
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      fitness_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          bmi: number | null
          created_at: string
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          bmi?: number | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          bmi?: number | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          created_at: string
          daily_routine_id: string
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: number | null
          rest_seconds: number | null
          sets: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          daily_routine_id: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          daily_routine_id?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_daily_routine_id_fkey"
            columns: ["daily_routine_id"]
            isOneToOne: false
            referencedRelation: "daily_routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verifications: {
        Row: {
          created_at: string
          id: string
          user_id: string
          verification_type: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          verification_type?: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          verification_type?: string
          verified_at?: string
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          actual_distance_meters: number | null
          actual_duration_seconds: number | null
          actual_reps: number[] | null
          actual_weight_kg: number[] | null
          completed_at: string | null
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          rest_seconds: number | null
          sets_completed: number
          target_distance_meters: number | null
          target_duration_seconds: number | null
          target_reps: number | null
          target_sets: number | null
          target_weight_kg: number | null
          workout_id: string
        }
        Insert: {
          actual_distance_meters?: number | null
          actual_duration_seconds?: number | null
          actual_reps?: number[] | null
          actual_weight_kg?: number[] | null
          completed_at?: string | null
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          rest_seconds?: number | null
          sets_completed?: number
          target_distance_meters?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_sets?: number | null
          target_weight_kg?: number | null
          workout_id: string
        }
        Update: {
          actual_distance_meters?: number | null
          actual_duration_seconds?: number | null
          actual_reps?: number[] | null
          actual_weight_kg?: number[] | null
          completed_at?: string | null
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          rest_seconds?: number | null
          sets_completed?: number
          target_distance_meters?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_sets?: number | null
          target_weight_kg?: number | null
          workout_id?: string
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
      workout_routines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string
          daily_routine_id: string | null
          id: string
          name: string
          notes: string | null
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["workout_status"]
          total_duration_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string
          daily_routine_id?: string | null
          id?: string
          name: string
          notes?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["workout_status"]
          total_duration_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string
          daily_routine_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["workout_status"]
          total_duration_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_daily_routine_id_fkey"
            columns: ["daily_routine_id"]
            isOneToOne: false
            referencedRelation: "daily_routines"
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
      exercise_type:
        | "weights"
        | "bodyweight"
        | "cardio"
        | "flexibility"
        | "other"
      goal_status: "active" | "completed" | "paused" | "cancelled"
      goal_type:
        | "weight_loss"
        | "weight_gain"
        | "muscle_building"
        | "strength"
        | "endurance"
        | "general_fitness"
        | "muscle_gain"
      muscle_group:
        | "chest"
        | "back"
        | "shoulders"
        | "arms"
        | "core"
        | "legs"
        | "full_body"
        | "cardio"
      workout_status: "planned" | "in_progress" | "completed" | "skipped"
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
      exercise_type: [
        "weights",
        "bodyweight",
        "cardio",
        "flexibility",
        "other",
      ],
      goal_status: ["active", "completed", "paused", "cancelled"],
      goal_type: [
        "weight_loss",
        "weight_gain",
        "muscle_building",
        "strength",
        "endurance",
        "general_fitness",
        "muscle_gain",
      ],
      muscle_group: [
        "chest",
        "back",
        "shoulders",
        "arms",
        "core",
        "legs",
        "full_body",
        "cardio",
      ],
      workout_status: ["planned", "in_progress", "completed", "skipped"],
    },
  },
} as const
