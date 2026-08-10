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
      estimate_versions: {
        Row: {
          created_at: string
          estimate_id: string
          id: string
          is_approved: boolean
          snapshot: Json
          version: number
        }
        Insert: {
          created_at?: string
          estimate_id: string
          id?: string
          is_approved?: boolean
          snapshot?: Json
          version?: number
        }
        Update: {
          created_at?: string
          estimate_id?: string
          id?: string
          is_approved?: boolean
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_versions_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          address: string
          approved_at: string | null
          approved_by_name: string
          approved_ip: string
          approved_session: string
          approved_snapshot: Json | null
          created_at: string
          customer_name: string
          discount_type: string
          discount_value: number
          doc_date: string
          email: string
          id: string
          items: Json
          note: string
          number: string
          object_name: string
          phone: string
          public_token: string
          status: string
          total: number
          updated_at: string
          valid_until: string
          version: number
          work_period: string
        }
        Insert: {
          address?: string
          approved_at?: string | null
          approved_by_name?: string
          approved_ip?: string
          approved_session?: string
          approved_snapshot?: Json | null
          created_at?: string
          customer_name?: string
          discount_type?: string
          discount_value?: number
          doc_date?: string
          email?: string
          id?: string
          items?: Json
          note?: string
          number?: string
          object_name?: string
          phone?: string
          public_token?: string
          status?: string
          total?: number
          updated_at?: string
          valid_until?: string
          version?: number
          work_period?: string
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by_name?: string
          approved_ip?: string
          approved_session?: string
          approved_snapshot?: Json | null
          created_at?: string
          customer_name?: string
          discount_type?: string
          discount_value?: number
          doc_date?: string
          email?: string
          id?: string
          items?: Json
          note?: string
          number?: string
          object_name?: string
          phone?: string
          public_token?: string
          status?: string
          total?: number
          updated_at?: string
          valid_until?: string
          version?: number
          work_period?: string
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor: string
          created_at: string
          estimate_id: string | null
          from_status: string
          id: string
          kind: string
          message: string
          meta: Json
          order_id: string | null
          to_status: string
        }
        Insert: {
          actor?: string
          created_at?: string
          estimate_id?: string | null
          from_status?: string
          id?: string
          kind?: string
          message?: string
          meta?: Json
          order_id?: string | null
          to_status?: string
        }
        Update: {
          actor?: string
          created_at?: string
          estimate_id?: string | null
          from_status?: string
          id?: string
          kind?: string
          message?: string
          meta?: Json
          order_id?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          approved_at: string | null
          approved_snapshot: Json | null
          created_at: string
          customer_name: string
          email: string
          estimate_id: string | null
          estimate_number: string
          estimate_version: number
          id: string
          items: Json
          note: string
          number: string
          object_name: string
          paid_amount: number
          payment_status: string
          phone: string
          prepayment_percent: number
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          address?: string
          approved_at?: string | null
          approved_snapshot?: Json | null
          created_at?: string
          customer_name?: string
          email?: string
          estimate_id?: string | null
          estimate_number?: string
          estimate_version?: number
          id?: string
          items?: Json
          note?: string
          number?: string
          object_name?: string
          paid_amount?: number
          payment_status?: string
          phone?: string
          prepayment_percent?: number
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_snapshot?: Json | null
          created_at?: string
          customer_name?: string
          email?: string
          estimate_id?: string | null
          estimate_number?: string
          estimate_version?: number
          id?: string
          items?: Json
          note?: string
          number?: string
          object_name?: string
          paid_amount?: number
          payment_status?: string
          phone?: string
          prepayment_percent?: number
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_designs: {
        Row: {
          created_at: string
          design: Json | null
          id: string
          image: string
          input: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          design?: Json | null
          id?: string
          image?: string
          input?: Json
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          design?: Json | null
          id?: string
          image?: string
          input?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      panel_schematics: {
        Row: {
          created_at: string
          doc: Json
          id: string
          object_name: string
          panel_design_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc?: Json
          id?: string
          object_name?: string
          panel_design_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc?: Json
          id?: string
          object_name?: string
          panel_design_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_schematics_panel_design_id_fkey"
            columns: ["panel_design_id"]
            isOneToOne: false
            referencedRelation: "panel_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      price_items: {
        Row: {
          category: string
          comment: string
          created_at: string
          id: string
          name: string
          price: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          comment?: string
          created_at?: string
          id?: string
          name: string
          price?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          comment?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_images: {
        Row: {
          caption: string
          created_at: string
          id: string
          image_url: string
          project_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          image_url: string
          project_id: string
          sort_order?: number
          storage_path?: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          image_url?: string
          project_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cover_image: string
          created_at: string
          description: string
          id: string
          is_published: boolean
          location: string
          sort_order: number
          title: string
          updated_at: string
          work_date: string | null
        }
        Insert: {
          cover_image?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          location?: string
          sort_order?: number
          title?: string
          updated_at?: string
          work_date?: string | null
        }
        Update: {
          cover_image?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          location?: string
          sort_order?: number
          title?: string
          updated_at?: string
          work_date?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          icon: string
          id: string
          sort_order: number
          text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          sort_order?: number
          text?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          sort_order?: number
          text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          comment: string
          created_at: string
          id: string
          name: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          name: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          created_at: string
          id: string
          image_key: string
          sort_order: number
          text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_key?: string
          sort_order?: number
          text?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_key?: string
          sort_order?: number
          text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
