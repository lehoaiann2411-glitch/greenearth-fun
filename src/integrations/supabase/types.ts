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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          description_vi: string | null
          icon: string | null
          id: string
          name: string
          name_vi: string | null
          requirement_type: string
          requirement_value: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          icon?: string | null
          id?: string
          name: string
          name_vi?: string | null
          requirement_type: string
          requirement_value?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_vi?: string | null
          requirement_type?: string
          requirement_value?: number | null
        }
        Relationships: []
      }
      campaign_participants: {
        Row: {
          campaign_id: string
          checked_in_at: string | null
          id: string
          notes: string | null
          registered_at: string
          status: Database["public"]["Enums"]["participant_status"]
          trees_planted: number | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          checked_in_at?: string | null
          id?: string
          notes?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["participant_status"]
          trees_planted?: number | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          checked_in_at?: string | null
          id?: string
          notes?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["participant_status"]
          trees_planted?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          category: Database["public"]["Enums"]["campaign_category"]
          created_at: string
          creator_id: string
          description: string | null
          end_date: string
          green_points_reward: number
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          organization_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          target_participants: number
          target_trees: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["campaign_category"]
          created_at?: string
          creator_id: string
          description?: string | null
          end_date: string
          green_points_reward?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_participants?: number
          target_trees?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["campaign_category"]
          created_at?: string
          creator_id?: string
          description?: string | null
          end_date?: string
          green_points_reward?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_participants?: number
          target_trees?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      claims_history: {
        Row: {
          camly_received: number
          created_at: string | null
          green_points_converted: number
          id: string
          status: string | null
          transaction_hash: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          camly_received: number
          created_at?: string | null
          green_points_converted: number
          id?: string
          status?: string | null
          transaction_hash?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          camly_received?: number
          created_at?: string | null
          green_points_converted?: number
          id?: string
          status?: string | null
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_limits: {
        Row: {
          created_at: string | null
          id: string
          likes_count: number | null
          limit_date: string
          shares_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          limit_date?: string
          shares_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          limit_date?: string
          shares_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quests: {
        Row: {
          created_at: string | null
          description: string | null
          description_vi: string | null
          id: string
          is_active: boolean | null
          points_reward: number | null
          quest_type: string
          title: string
          title_vi: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          quest_type: string
          title: string
          title_vi?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          quest_type?: string
          title?: string
          title_vi?: string | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          rsvp_status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          rsvp_status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          rsvp_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_vi: string | null
          end_time: string | null
          event_date: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          max_attendees: number | null
          start_time: string | null
          title: string
          title_vi: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_vi?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_attendees?: number | null
          start_time?: string | null
          title: string
          title_vi?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_vi?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_attendees?: number | null
          start_time?: string | null
          title?: string
          title_vi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      green_nfts: {
        Row: {
          certificate_number: string | null
          co2_absorbed: number | null
          contract_address: string | null
          created_at: string
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          metadata_uri: string | null
          planted_at: string
          token_id: string | null
          transaction_hash: string | null
          tree_type: string
          user_id: string
          verified: boolean
        }
        Insert: {
          certificate_number?: string | null
          co2_absorbed?: number | null
          contract_address?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata_uri?: string | null
          planted_at?: string
          token_id?: string | null
          transaction_hash?: string | null
          tree_type: string
          user_id: string
          verified?: boolean
        }
        Update: {
          certificate_number?: string | null
          co2_absorbed?: number | null
          contract_address?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata_uri?: string | null
          planted_at?: string
          token_id?: string | null
          transaction_hash?: string | null
          tree_type?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          camly_amount: number | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          camly_amount?: number | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          camly_amount?: number | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          esg_focus: string[] | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          esg_focus?: string[] | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          esg_focus?: string[] | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      points_history: {
        Row: {
          action_type: string
          camly_earned: number | null
          camly_equivalent: number
          created_at: string | null
          description: string | null
          id: string
          points_earned: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          camly_earned?: number | null
          camly_equivalent: number
          created_at?: string | null
          description?: string | null
          id?: string
          points_earned: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          camly_earned?: number | null
          camly_equivalent?: number
          created_at?: string | null
          description?: string | null
          id?: string
          points_earned?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          campaign_id: string | null
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          location_name: string | null
          media_urls: string[] | null
          post_type: string | null
          shares_count: number | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          campaign_id?: string | null
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          location_name?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          campaign_id?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          location_name?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          bio: string | null
          camly_balance: number | null
          campaigns_joined: number
          created_at: string
          current_streak: number | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          green_points: number
          green_reputation: number | null
          id: string
          last_check_in: string | null
          location: string | null
          total_camly_claimed: number | null
          total_likes_given: number | null
          total_posts: number | null
          total_shares: number | null
          trees_planted: number
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio?: string | null
          camly_balance?: number | null
          campaigns_joined?: number
          created_at?: string
          current_streak?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          green_points?: number
          green_reputation?: number | null
          id: string
          last_check_in?: string | null
          location?: string | null
          total_camly_claimed?: number | null
          total_likes_given?: number | null
          total_posts?: number | null
          total_shares?: number | null
          trees_planted?: number
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio?: string | null
          camly_balance?: number | null
          campaigns_joined?: number
          created_at?: string
          current_streak?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          green_points?: number
          green_reputation?: number | null
          id?: string
          last_check_in?: string | null
          location?: string | null
          total_camly_claimed?: number | null
          total_likes_given?: number | null
          total_posts?: number | null
          total_shares?: number | null
          trees_planted?: number
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          media_type: string | null
          media_url: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string | null
          media_url: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quest_progress: {
        Row: {
          completed_at: string | null
          id: string
          quest_date: string | null
          quest_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quest_date?: string | null
          quest_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          quest_date?: string | null
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "daily_quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quest_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      account_type: "individual" | "organization"
      app_role: "admin" | "moderator" | "user"
      campaign_category:
        | "tree_planting"
        | "cleanup"
        | "recycling"
        | "awareness"
        | "other"
      campaign_status:
        | "draft"
        | "pending"
        | "active"
        | "completed"
        | "cancelled"
      participant_status:
        | "registered"
        | "checked_in"
        | "completed"
        | "cancelled"
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
      account_type: ["individual", "organization"],
      app_role: ["admin", "moderator", "user"],
      campaign_category: [
        "tree_planting",
        "cleanup",
        "recycling",
        "awareness",
        "other",
      ],
      campaign_status: ["draft", "pending", "active", "completed", "cancelled"],
      participant_status: [
        "registered",
        "checked_in",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
