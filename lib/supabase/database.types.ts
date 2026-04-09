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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          last_action_at: string
          note: string | null
          status: Database["public"]["Enums"]["application_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          last_action_at?: string
          note?: string | null
          status?: Database["public"]["Enums"]["application_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          last_action_at?: string
          note?: string | null
          status?: Database["public"]["Enums"]["application_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cvs: {
        Row: {
          created_at: string
          file_path: string
          id: string
          label: string
          tag: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          label: string
          tag?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          label?: string
          tag?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cvs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          contract_type: string | null
          created_at: string
          dedup_hash: string
          description: string | null
          id: string
          location: string | null
          published_at: string | null
          remote_status: Database["public"]["Enums"]["remote_status_enum"]
          salary_max: number | null
          salary_min: number | null
          source: string
          source_id: string | null
          source_url: string
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          contract_type?: string | null
          created_at?: string
          dedup_hash: string
          description?: string | null
          id?: string
          location?: string | null
          published_at?: string | null
          remote_status?: Database["public"]["Enums"]["remote_status_enum"]
          salary_max?: number | null
          salary_min?: number | null
          source: string
          source_id?: string | null
          source_url: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          contract_type?: string | null
          created_at?: string
          dedup_hash?: string
          description?: string | null
          id?: string
          location?: string | null
          published_at?: string | null
          remote_status?: Database["public"]["Enums"]["remote_status_enum"]
          salary_max?: number | null
          salary_min?: number | null
          source?: string
          source_id?: string | null
          source_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contract_types: string[]
          created_at: string
          email: string
          exclude_keywords: string[]
          excluded_companies: string[]
          full_name: string | null
          id: string
          include_keywords: string[]
          locations: string[]
          min_salary: number | null
          onboarding_completed: boolean
          remote_preference: Database["public"]["Enums"]["remote_preference_enum"]
          target_titles: string[]
          updated_at: string
        }
        Insert: {
          contract_types?: string[]
          created_at?: string
          email: string
          exclude_keywords?: string[]
          excluded_companies?: string[]
          full_name?: string | null
          id: string
          include_keywords?: string[]
          locations?: string[]
          min_salary?: number | null
          onboarding_completed?: boolean
          remote_preference?: Database["public"]["Enums"]["remote_preference_enum"]
          target_titles?: string[]
          updated_at?: string
        }
        Update: {
          contract_types?: string[]
          created_at?: string
          email?: string
          exclude_keywords?: string[]
          excluded_companies?: string[]
          full_name?: string | null
          id?: string
          include_keywords?: string[]
          locations?: string[]
          min_salary?: number | null
          onboarding_completed?: boolean
          remote_preference?: Database["public"]["Enums"]["remote_preference_enum"]
          target_titles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      user_job_interactions: {
        Row: {
          created_at: string
          dismiss_reason: string | null
          id: string
          job_id: string
          note: string | null
          score: number | null
          type: Database["public"]["Enums"]["interaction_type_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismiss_reason?: string | null
          id?: string
          job_id: string
          note?: string | null
          score?: number | null
          type: Database["public"]["Enums"]["interaction_type_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismiss_reason?: string | null
          id?: string
          job_id?: string
          note?: string | null
          score?: number | null
          type?: Database["public"]["Enums"]["interaction_type_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_job_interactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_job_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      application_status_enum: "saved" | "applied" | "done"
      interaction_type_enum: "view" | "save" | "dismiss" | "apply"
      remote_preference_enum: "remote" | "hybrid" | "onsite" | "any"
      remote_status_enum: "remote" | "hybrid" | "onsite" | "unknown"
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
      application_status_enum: ["saved", "applied", "done"],
      interaction_type_enum: ["view", "save", "dismiss", "apply"],
      remote_preference_enum: ["remote", "hybrid", "onsite", "any"],
      remote_status_enum: ["remote", "hybrid", "onsite", "unknown"],
    },
  },
} as const
