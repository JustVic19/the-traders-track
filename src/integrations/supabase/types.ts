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
      missions: {
        Row: {
          created_at: string
          description: string
          id: string
          is_template: boolean
          max_value: number | null
          min_value: number | null
          mission_key: string
          target_value: number
          title: string
          type: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_template?: boolean
          max_value?: number | null
          min_value?: number | null
          mission_key: string
          target_value?: number
          title: string
          type: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_template?: boolean
          max_value?: number | null
          min_value?: number | null
          mission_key?: string
          target_value?: number
          title?: string
          type?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alpha_coins: number
          created_at: string
          focus_points: number
          id: string
          level: number
          onboarding_completed: boolean
          plan: string | null
          skill_points: number
          trader_avatar: string | null
          trading_goal: string | null
          updated_at: string
          username: string | null
          weekly_insights: string | null
          weekly_insights_date: string | null
          xp: number
        }
        Insert: {
          alpha_coins?: number
          created_at?: string
          focus_points?: number
          id: string
          level?: number
          onboarding_completed?: boolean
          plan?: string | null
          skill_points?: number
          trader_avatar?: string | null
          trading_goal?: string | null
          updated_at?: string
          username?: string | null
          weekly_insights?: string | null
          weekly_insights_date?: string | null
          xp?: number
        }
        Update: {
          alpha_coins?: number
          created_at?: string
          focus_points?: number
          id?: string
          level?: number
          onboarding_completed?: boolean
          plan?: string | null
          skill_points?: number
          trader_avatar?: string | null
          trading_goal?: string | null
          updated_at?: string
          username?: string | null
          weekly_insights?: string | null
          weekly_insights_date?: string | null
          xp?: number
        }
        Relationships: []
      }
      store_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          item_key: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          item_key: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          item_key?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          entry_date: string
          entry_price: number
          exit_date: string | null
          exit_price: number | null
          id: string
          is_open: boolean
          notes: string | null
          profit_loss: number | null
          quantity: number
          symbol: string
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_date: string
          entry_price: number
          exit_date?: string | null
          exit_price?: number | null
          id?: string
          is_open?: boolean
          notes?: string | null
          profit_loss?: number | null
          quantity: number
          symbol: string
          trade_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          entry_price?: number
          exit_date?: string | null
          exit_price?: number | null
          id?: string
          is_open?: boolean
          notes?: string | null
          profit_loss?: number | null
          quantity?: number
          symbol?: string
          trade_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_generated_missions: {
        Row: {
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          current_progress: number
          description: string
          expires_at: string
          generated_date: string
          id: string
          is_claimed: boolean
          is_completed: boolean
          mission_type: string
          target_value: number
          template_id: string
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          description: string
          expires_at: string
          generated_date?: string
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          mission_type: string
          target_value: number
          template_id: string
          title: string
          updated_at?: string
          user_id: string
          xp_reward: number
        }
        Update: {
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          description?: string
          expires_at?: string
          generated_date?: string
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          mission_type?: string
          target_value?: number
          template_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_generated_missions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          id: string
          is_equipped: boolean
          purchased_at: string
          store_item_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_equipped?: boolean
          purchased_at?: string
          store_item_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_equipped?: boolean
          purchased_at?: string
          store_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          is_claimed: boolean
          is_completed: boolean
          mission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          mission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          mission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          skill_key: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill_key: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill_key?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_user_id_fkey"
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
      analyze_trade_and_grant_xp: {
        Args: {
          user_profile_id: string
          trade_notes: string
          trade_profit_loss: number
          trade_type: string
        }
        Returns: undefined
      }
      create_default_skills_for_user: {
        Args: { user_profile_id: string }
        Returns: undefined
      }
      generate_daily_missions_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_daily_missions_for_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      generate_weekly_insights_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_weekly_insights_for_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      grant_monthly_pro_coins: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      grant_skill_xp: {
        Args: {
          user_profile_id: string
          skill_name_param: string
          xp_amount: number
        }
        Returns: undefined
      }
      invest_focus_points: {
        Args: { skill_name_param: string; points_amount: number }
        Returns: Json
      }
      purchase_store_item: {
        Args: { item_id: string; user_profile_id: string }
        Returns: Json
      }
      upgrade_skill: {
        Args: { user_profile_id: string; skill_name_param: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
