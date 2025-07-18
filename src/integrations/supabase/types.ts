export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      guild_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          earned_at: string
          guild_id: string
          id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          earned_at?: string
          guild_id: string
          id?: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          earned_at?: string
          guild_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_achievements_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_tournament_results: {
        Row: {
          combined_profit_factor: number
          created_at: string
          guild_id: string
          id: string
          members_count: number
          rank: number
          total_trades: number
          tournament_id: string
        }
        Insert: {
          combined_profit_factor?: number
          created_at?: string
          guild_id: string
          id?: string
          members_count: number
          rank: number
          total_trades?: number
          tournament_id: string
        }
        Update: {
          combined_profit_factor?: number
          created_at?: string
          guild_id?: string
          id?: string
          members_count?: number
          rank?: number
          total_trades?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_tournament_results_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_tournament_results_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "guild_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_tournaments: {
        Row: {
          created_at: string
          id: string
          status: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      guilds: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          is_private: boolean
          max_members: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean
          max_members?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean
          max_members?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guilds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          equipped_aura: string | null
          equipped_hat: string | null
          equipped_outfit: string | null
          focus_points: number
          id: string
          level: number
          mistake_pattern_date: string | null
          mistake_pattern_insight: string | null
          mistake_pattern_type: string | null
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
          equipped_aura?: string | null
          equipped_hat?: string | null
          equipped_outfit?: string | null
          focus_points?: number
          id: string
          level?: number
          mistake_pattern_date?: string | null
          mistake_pattern_insight?: string | null
          mistake_pattern_type?: string | null
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
          equipped_aura?: string | null
          equipped_hat?: string | null
          equipped_outfit?: string | null
          focus_points?: number
          id?: string
          level?: number
          mistake_pattern_date?: string | null
          mistake_pattern_insight?: string | null
          mistake_pattern_type?: string | null
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
          trading_plan_id: string | null
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
          trading_plan_id?: string | null
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
          trading_plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_trading_plan_id_fkey"
            columns: ["trading_plan_id"]
            isOneToOne: false
            referencedRelation: "trading_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_plans: {
        Row: {
          created_at: string
          entry_rules: string
          exit_rules: string
          id: string
          risk_management_rules: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_rules: string
          exit_rules: string
          id?: string
          risk_management_rules: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_rules?: string
          exit_rules?: string
          id?: string
          risk_management_rules?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_plans_user_id_fkey"
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
          current_xp: number
          id: string
          max_xp: number
          skill_key: string
          skill_level: number
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_xp?: number
          id?: string
          max_xp?: number
          skill_key: string
          skill_level?: number
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_xp?: number
          id?: string
          max_xp?: number
          skill_key?: string
          skill_level?: number
          unlocked_at?: string
          updated_at?: string
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
      analyze_user_mistake_patterns: {
        Args: { target_user_id: string }
        Returns: Json
      }
      calculate_guild_metrics: {
        Args: { guild_id_param: string; start_date?: string; end_date?: string }
        Returns: Json
      }
      complete_weekly_tournament: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_default_skills_for_user: {
        Args: { user_profile_id: string }
        Returns: undefined
      }
      equip_avatar_item: {
        Args: {
          user_profile_id: string
          item_id: string
          item_category: string
        }
        Returns: Json
      }
      generate_daily_missions_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_daily_missions_for_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      generate_mistake_pattern_mission: {
        Args: {
          target_user_id: string
          pattern_type: string
          pattern_description: string
        }
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
      grant_focus_points: {
        Args: { user_profile_id: string; points_amount: number }
        Returns: undefined
      }
      grant_monthly_pro_coins: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      grant_skill_xp: {
        Args: {
          user_profile_id: string
          skill_key_param: string
          xp_amount: number
        }
        Returns: undefined
      }
      invest_focus_points: {
        Args: { skill_key_param: string; points_amount: number }
        Returns: Json
      }
      purchase_store_item: {
        Args: { item_id: string; user_profile_id: string }
        Returns: Json
      }
      start_weekly_tournament: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upgrade_skill: {
        Args: { user_profile_id: string; skill_key_param: string }
        Returns: Json
      }
      validate_and_process_trade: {
        Args: { trade_data: Json }
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
