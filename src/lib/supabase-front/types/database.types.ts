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
      extraction_results: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          data: Json
          deleted_at: string | null
          email: string | null
          extraction_id: string
          id: number
          latitude: number | null
          longitude: number | null
          phone: string | null
          place_name: string | null
          rating: number | null
          review_count: number | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          data: Json
          deleted_at?: string | null
          email?: string | null
          extraction_id: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          place_name?: string | null
          rating?: number | null
          review_count?: number | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          data?: Json
          deleted_at?: string | null
          email?: string | null
          extraction_id?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          place_name?: string | null
          rating?: number | null
          review_count?: number | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_results_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "extractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extraction_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_tags: {
        Row: {
          created_at: string
          extraction_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          extraction_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          extraction_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_tags_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "extractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extraction_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      extractions: {
        Row: {
          completed_at: string | null
          config: Json | null
          core_job_id: string | null
          country_code: string | null
          created_at: string
          csv_url: string | null
          deleted_at: string | null
          depth: number
          description: string | null
          error_message: string | null
          estimated_duration: number | null
          excel_url: string | null
          extract_emails: boolean | null
          extract_reviews: boolean | null
          fast_mode: boolean | null
          id: string
          keywords: string[]
          language: string
          latitude: number | null
          longitude: number | null
          max_results: number | null
          name: string
          progress: number | null
          project_id: string | null
          proxies: string[] | null
          query: string | null
          radius: number | null
          result_file_path: string | null
          scraper_job_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["extraction_status"]
          total_places_extracted: number | null
          total_places_found: number | null
          total_results: number | null
          updated_at: string
          user_id: string
          zoom_level: number | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          core_job_id?: string | null
          country_code?: string | null
          created_at?: string
          csv_url?: string | null
          deleted_at?: string | null
          depth?: number
          description?: string | null
          error_message?: string | null
          estimated_duration?: number | null
          excel_url?: string | null
          extract_emails?: boolean | null
          extract_reviews?: boolean | null
          fast_mode?: boolean | null
          id?: string
          keywords: string[]
          language?: string
          latitude?: number | null
          longitude?: number | null
          max_results?: number | null
          name: string
          progress?: number | null
          project_id?: string | null
          proxies?: string[] | null
          query?: string | null
          radius?: number | null
          result_file_path?: string | null
          scraper_job_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["extraction_status"]
          total_places_extracted?: number | null
          total_places_found?: number | null
          total_results?: number | null
          updated_at?: string
          user_id: string
          zoom_level?: number | null
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          core_job_id?: string | null
          country_code?: string | null
          created_at?: string
          csv_url?: string | null
          deleted_at?: string | null
          depth?: number
          description?: string | null
          error_message?: string | null
          estimated_duration?: number | null
          excel_url?: string | null
          extract_emails?: boolean | null
          extract_reviews?: boolean | null
          fast_mode?: boolean | null
          id?: string
          keywords?: string[]
          language?: string
          latitude?: number | null
          longitude?: number | null
          max_results?: number | null
          name?: string
          progress?: number | null
          project_id?: string | null
          proxies?: string[] | null
          query?: string | null
          radius?: number | null
          result_file_path?: string | null
          scraper_job_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["extraction_status"]
          total_places_extracted?: number | null
          total_places_found?: number | null
          total_results?: number | null
          updated_at?: string
          user_id?: string
          zoom_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extractions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extractions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gmaps_jobs: {
        Row: {
          created_at: string
          deleted_at: string | null
          error_message: string | null
          extraction_id: string | null
          id: string
          payload: string
          payload_type: string
          priority: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          extraction_id?: string | null
          id?: string
          payload: string
          payload_type: string
          priority?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          extraction_id?: string | null
          id?: string
          payload?: string
          payload_type?: string
          priority?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmaps_jobs_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "extractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gmaps_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          extractions_count: number | null
          icon: string | null
          id: string
          name: string
          total_leads: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          extractions_count?: number | null
          icon?: string | null
          id?: string
          name: string
          total_leads?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          extractions_count?: number | null
          icon?: string | null
          id?: string
          name?: string
          total_leads?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          searches_limit: number
          searches_used: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          searches_limit?: number
          searches_used?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          searches_limit?: number
          searches_used?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_extraction: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_old_soft_deleted_records: {
        Args: { days_old?: number }
        Returns: number
      }
      export_extraction_to_json: {
        Args: { p_extraction_id: string }
        Returns: Json
      }
      get_extraction_progress: {
        Args: { p_extraction_id: string }
        Returns: {
          estimated_completion: string
          id: string
          progress: number
          query: string
          started_at: string
          status: Database["public"]["Enums"]["extraction_status"]
          total_results: number
        }[]
      }
      get_project_summary: {
        Args: { p_project_id: string }
        Returns: {
          completed_extractions: number
          failed_extractions: number
          last_extraction_date: string
          project_id: string
          project_name: string
          total_extractions: number
          total_leads: number
        }[]
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: {
          plan: string
          searches_remaining: number
          searches_used: number
          total_extractions: number
          total_leads: number
          total_projects: number
        }[]
      }
      reset_monthly_searches: { Args: Record<PropertyKey, never>; Returns: undefined }
      restore_extraction: {
        Args: { extraction_id: string }
        Returns: undefined
      }
      search_extractions: {
        Args: { p_search_term: string; p_user_id: string }
        Returns: {
          created_at: string
          id: string
          query: string
          rank: number
          status: Database["public"]["Enums"]["extraction_status"]
          total_results: number
        }[]
      }
      soft_delete_extraction: {
        Args: { extraction_id: string }
        Returns: undefined
      }
    }
    Enums: {
      extraction_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      job_priority: "low" | "medium" | "high" | "urgent"
      subscription_plan: "free" | "basic" | "pro" | "enterprise"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "paused"
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
      extraction_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      job_priority: ["low", "medium", "high", "urgent"],
      subscription_plan: ["free", "basic", "pro", "enterprise"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "paused",
      ],
    },
  },
} as const
