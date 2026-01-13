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
      call_recordings: {
        Row: {
          call_id: string | null
          created_at: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          file_url: string
          group_call_id: string | null
          id: string
          recorded_by: string
        }
        Insert: {
          call_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_url: string
          group_call_id?: string | null
          id?: string
          recorded_by: string
        }
        Update: {
          call_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_url?: string
          group_call_id?: string | null
          id?: string
          recorded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_group_call_id_fkey"
            columns: ["group_call_id"]
            isOneToOne: false
            referencedRelation: "group_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_type: string
          callee_id: string
          caller_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          call_type?: string
          callee_id: string
          caller_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          call_type?: string
          callee_id?: string
          caller_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_callee_id_fkey"
            columns: ["callee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      camly_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          message_id: string | null
          receiver_id: string
          sender_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          message_id?: string | null
          receiver_id: string
          sender_id: string
          transaction_type?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          message_id?: string | null
          receiver_id?: string
          sender_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "camly_transactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camly_transactions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camly_transactions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          forest_type: string | null
          green_points_reward: number
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          organization_id: string | null
          region: string | null
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
          forest_type?: string | null
          green_points_reward?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization_id?: string | null
          region?: string | null
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
          forest_type?: string | null
          green_points_reward?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization_id?: string | null
          region?: string | null
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
      chatbot_conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          messages_count: number | null
          points_earned: number | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          messages_count?: number | null
          points_earned?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          messages_count?: number | null
          points_earned?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      content_views: {
        Row: {
          content_id: string
          id: string
          points_earned: number | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          content_id: string
          id?: string
          points_earned?: number | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          content_id?: string
          id?: string
          points_earned?: number | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_views_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "educational_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          camly_reward: number | null
          category: string | null
          created_at: string | null
          description: string | null
          description_vi: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
          title_vi: string
        }
        Insert: {
          camly_reward?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
          title_vi: string
        }
        Update: {
          camly_reward?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          title_vi?: string
        }
        Relationships: []
      }
      daily_limits: {
        Row: {
          created_at: string | null
          id: string
          likes_count: number | null
          limit_date: string
          reel_comments_count: number | null
          reel_likes_count: number | null
          reel_shares_count: number | null
          shares_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          limit_date?: string
          reel_comments_count?: number | null
          reel_likes_count?: number | null
          reel_shares_count?: number | null
          shares_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          limit_date?: string
          reel_comments_count?: number | null
          reel_likes_count?: number | null
          reel_shares_count?: number | null
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
      educational_content: {
        Row: {
          category: string
          content_type: string
          created_at: string | null
          description: string | null
          description_vi: string | null
          duration_seconds: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          media_url: string | null
          points_reward: number | null
          thumbnail_url: string | null
          title: string
          title_vi: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          duration_seconds?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          media_url?: string | null
          points_reward?: number | null
          thumbnail_url?: string | null
          title: string
          title_vi?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          duration_seconds?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          media_url?: string | null
          points_reward?: number | null
          thumbnail_url?: string | null
          title?: string
          title_vi?: string | null
          updated_at?: string | null
          view_count?: number | null
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
      forest_areas: {
        Row: {
          area_hectares: number | null
          campaign_id: string | null
          coordinates: Json
          created_at: string | null
          created_by: string | null
          forest_type: string | null
          id: string
          name: string
          trees_count: number | null
          updated_at: string | null
        }
        Insert: {
          area_hectares?: number | null
          campaign_id?: string | null
          coordinates: Json
          created_at?: string | null
          created_by?: string | null
          forest_type?: string | null
          id?: string
          name: string
          trees_count?: number | null
          updated_at?: string | null
        }
        Update: {
          area_hectares?: number | null
          campaign_id?: string | null
          coordinates?: Json
          created_at?: string | null
          created_by?: string | null
          forest_type?: string | null
          id?: string
          name?: string
          trees_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_areas_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          accepted_at: string | null
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_call_participants: {
        Row: {
          group_call_id: string
          id: string
          is_muted: boolean | null
          is_video_off: boolean | null
          joined_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          group_call_id: string
          id?: string
          is_muted?: boolean | null
          is_video_off?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          group_call_id?: string
          id?: string
          is_muted?: boolean | null
          is_video_off?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_call_participants_group_call_id_fkey"
            columns: ["group_call_id"]
            isOneToOne: false
            referencedRelation: "group_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_call_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_calls: {
        Row: {
          call_type: string | null
          created_at: string | null
          ended_at: string | null
          id: string
          initiator_id: string
          max_participants: number | null
          started_at: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          call_type?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          initiator_id: string
          max_participants?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          call_type?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          initiator_id?: string
          max_participants?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_calls_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_events: {
        Row: {
          campaign_id: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          description_vi: string | null
          end_time: string | null
          event_date: string
          group_id: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          max_attendees: number | null
          rsvp_count: number | null
          start_time: string | null
          title: string
          title_vi: string | null
        }
        Insert: {
          campaign_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          description_vi?: string | null
          end_time?: string | null
          event_date: string
          group_id: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_attendees?: number | null
          rsvp_count?: number | null
          start_time?: string | null
          title: string
          title_vi?: string | null
        }
        Update: {
          campaign_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          description_vi?: string | null
          end_time?: string | null
          event_date?: string
          group_id?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_attendees?: number | null
          rsvp_count?: number | null
          start_time?: string | null
          title?: string
          title_vi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invites: {
        Row: {
          camly_earned: number | null
          created_at: string | null
          group_id: string
          id: string
          invite_accepted: boolean | null
          invitee_id: string
          invitee_posted: boolean | null
          inviter_id: string
        }
        Insert: {
          camly_earned?: number | null
          created_at?: string | null
          group_id: string
          id?: string
          invite_accepted?: boolean | null
          invitee_id: string
          invitee_posted?: boolean | null
          inviter_id: string
        }
        Update: {
          camly_earned?: number | null
          created_at?: string | null
          group_id?: string
          id?: string
          invite_accepted?: boolean | null
          invitee_id?: string
          invitee_posted?: boolean | null
          inviter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          camly_earned: number | null
          group_id: string
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          group_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          group_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "group_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          camly_earned: number | null
          comments_count: number | null
          content: string
          created_at: string | null
          feeling: string | null
          group_id: string
          id: string
          is_announcement: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          feeling?: string | null
          group_id: string
          id?: string
          is_announcement?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          feeling?: string | null
          group_id?: string
          id?: string
          is_announcement?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          description_vi: string | null
          events_count: number | null
          icon_emoji: string | null
          id: string
          is_featured: boolean | null
          location: string | null
          location_vi: string | null
          members_count: number | null
          name: string
          name_vi: string | null
          posts_count: number | null
          privacy: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          description_vi?: string | null
          events_count?: number | null
          icon_emoji?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          location_vi?: string | null
          members_count?: number | null
          name: string
          name_vi?: string | null
          posts_count?: number | null
          privacy?: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          description_vi?: string | null
          events_count?: number | null
          icon_emoji?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          location_vi?: string | null
          members_count?: number | null
          name?: string
          name_vi?: string | null
          posts_count?: number | null
          privacy?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bio_vi: string | null
          cover_url: string | null
          created_at: string | null
          follower_count: string | null
          id: string
          is_featured: boolean | null
          name: string
          order_index: number | null
          platform: string
          profile_url: string | null
          specialty: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bio_vi?: string | null
          cover_url?: string | null
          created_at?: string | null
          follower_count?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          order_index?: number | null
          platform?: string
          profile_url?: string | null
          specialty?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bio_vi?: string | null
          cover_url?: string | null
          created_at?: string | null
          follower_count?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          order_index?: number | null
          platform?: string
          profile_url?: string | null
          specialty?: string[] | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          camly_amount: number | null
          content: string | null
          conversation_id: string
          created_at: string | null
          delivered_at: string | null
          id: string
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          payload: Json | null
          seen_at: string | null
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          camly_amount?: number | null
          content?: string | null
          conversation_id: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          payload?: Json | null
          seen_at?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          camly_amount?: number | null
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          payload?: Json | null
          seen_at?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      post_shares: {
        Row: {
          camly_earned: number | null
          created_at: string | null
          id: string
          original_post_id: string
          share_caption: string | null
          shared_by: string
          visibility: string | null
        }
        Insert: {
          camly_earned?: number | null
          created_at?: string | null
          id?: string
          original_post_id: string
          share_caption?: string | null
          shared_by: string
          visibility?: string | null
        }
        Update: {
          camly_earned?: number | null
          created_at?: string | null
          id?: string
          original_post_id?: string
          share_caption?: string | null
          shared_by?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          is_repost: boolean | null
          likes_count: number
          location_name: string | null
          media_urls: string[] | null
          original_post_id: string | null
          post_type: string | null
          share_caption: string | null
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
          is_repost?: boolean | null
          likes_count?: number
          location_name?: string | null
          media_urls?: string[] | null
          original_post_id?: string | null
          post_type?: string | null
          share_caption?: string | null
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
          is_repost?: boolean | null
          likes_count?: number
          location_name?: string | null
          media_urls?: string[] | null
          original_post_id?: string | null
          post_type?: string | null
          share_caption?: string | null
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
          {
            foreignKeyName: "posts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
          cover_photo_url: string | null
          created_at: string
          current_streak: number | null
          do_not_disturb: boolean | null
          education: string | null
          followers_count: number | null
          following_count: number | null
          friends_count: number | null
          full_name: string | null
          green_points: number
          green_reputation: number | null
          habit_streak: number | null
          id: string
          last_check_in: string | null
          last_habit_date: string | null
          location: string | null
          notification_sounds: boolean | null
          show_online_status: boolean | null
          total_camly_claimed: number | null
          total_likes_given: number | null
          total_posts: number | null
          total_shares: number | null
          trees_planted: number
          updated_at: string
          wallet_address: string | null
          website: string | null
          work: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio?: string | null
          camly_balance?: number | null
          campaigns_joined?: number
          cover_photo_url?: string | null
          created_at?: string
          current_streak?: number | null
          do_not_disturb?: boolean | null
          education?: string | null
          followers_count?: number | null
          following_count?: number | null
          friends_count?: number | null
          full_name?: string | null
          green_points?: number
          green_reputation?: number | null
          habit_streak?: number | null
          id: string
          last_check_in?: string | null
          last_habit_date?: string | null
          location?: string | null
          notification_sounds?: boolean | null
          show_online_status?: boolean | null
          total_camly_claimed?: number | null
          total_likes_given?: number | null
          total_posts?: number | null
          total_shares?: number | null
          trees_planted?: number
          updated_at?: string
          wallet_address?: string | null
          website?: string | null
          work?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio?: string | null
          camly_balance?: number | null
          campaigns_joined?: number
          cover_photo_url?: string | null
          created_at?: string
          current_streak?: number | null
          do_not_disturb?: boolean | null
          education?: string | null
          followers_count?: number | null
          following_count?: number | null
          friends_count?: number | null
          full_name?: string | null
          green_points?: number
          green_reputation?: number | null
          habit_streak?: number | null
          id?: string
          last_check_in?: string | null
          last_habit_date?: string | null
          location?: string | null
          notification_sounds?: boolean | null
          show_online_status?: boolean | null
          total_camly_claimed?: number | null
          total_likes_given?: number | null
          total_posts?: number | null
          total_shares?: number | null
          trees_planted?: number
          updated_at?: string
          wallet_address?: string | null
          website?: string | null
          work?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          explanation: string | null
          explanation_vi: string | null
          id: string
          options: Json
          order_index: number | null
          question: string
          question_vi: string | null
          quiz_id: string
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          explanation_vi?: string | null
          id?: string
          options?: Json
          order_index?: number | null
          question: string
          question_vi?: string | null
          quiz_id: string
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          explanation_vi?: string | null
          id?: string
          options?: Json
          order_index?: number | null
          question?: string
          question_vi?: string | null
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          attempts_count: number | null
          category: string
          created_at: string | null
          description: string | null
          description_vi: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_published: boolean | null
          points_reward: number | null
          questions_count: number | null
          title: string
          title_vi: string | null
          updated_at: string | null
        }
        Insert: {
          attempts_count?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          points_reward?: number | null
          questions_count?: number | null
          title: string
          title_vi?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts_count?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          points_reward?: number | null
          questions_count?: number | null
          title?: string
          title_vi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reel_comments: {
        Row: {
          camly_earned: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          reel_id: string
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          reel_id: string
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "reel_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_gifts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          receiver_id: string
          reel_id: string
          sender_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          receiver_id: string
          reel_id: string
          sender_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          receiver_id?: string
          reel_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_gifts_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_likes: {
        Row: {
          camly_earned: number | null
          created_at: string | null
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          created_at?: string | null
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          created_at?: string | null
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_shares: {
        Row: {
          camly_earned: number | null
          created_at: string | null
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          created_at?: string | null
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          created_at?: string | null
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_shares_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_views: {
        Row: {
          id: string
          reel_id: string
          viewed_at: string | null
          viewer_id: string
          watched_seconds: number | null
        }
        Insert: {
          id?: string
          reel_id: string
          viewed_at?: string | null
          viewer_id: string
          watched_seconds?: number | null
        }
        Update: {
          id?: string
          reel_id?: string
          viewed_at?: string | null
          viewer_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reel_views_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          camly_earned: number | null
          caption: string | null
          comments_count: number | null
          created_at: string | null
          duration_seconds: number
          hashtags: string[] | null
          id: string
          is_featured: boolean | null
          is_trending: boolean | null
          last_paid_views: number | null
          likes_count: number | null
          location_name: string | null
          music_name: string | null
          music_url: string | null
          shares_count: number | null
          tagged_friends: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          camly_earned?: number | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          duration_seconds?: number
          hashtags?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_trending?: boolean | null
          last_paid_views?: number | null
          likes_count?: number | null
          location_name?: string | null
          music_name?: string | null
          music_url?: string | null
          shares_count?: number | null
          tagged_friends?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          camly_earned?: number | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          duration_seconds?: number
          hashtags?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_trending?: boolean | null
          last_paid_views?: number | null
          likes_count?: number | null
          location_name?: string | null
          music_name?: string | null
          music_url?: string | null
          shares_count?: number | null
          tagged_friends?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reels: {
        Row: {
          created_at: string | null
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_reels_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_stories: {
        Row: {
          created_at: string | null
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          campaign_id: string | null
          caption: string | null
          created_at: string | null
          drawings: Json | null
          expires_at: string | null
          id: string
          location_name: string | null
          media_type: string | null
          media_url: string
          music_url: string | null
          reactions_count: number | null
          replies_count: number | null
          stickers: Json | null
          text_overlays: Json | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          campaign_id?: string | null
          caption?: string | null
          created_at?: string | null
          drawings?: Json | null
          expires_at?: string | null
          id?: string
          location_name?: string | null
          media_type?: string | null
          media_url: string
          music_url?: string | null
          reactions_count?: number | null
          replies_count?: number | null
          stickers?: Json | null
          text_overlays?: Json | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          campaign_id?: string | null
          caption?: string | null
          created_at?: string | null
          drawings?: Json | null
          expires_at?: string | null
          id?: string
          location_name?: string | null
          media_type?: string | null
          media_url?: string
          music_url?: string | null
          reactions_count?: number | null
          replies_count?: number | null
          stickers?: Json | null
          text_overlays?: Json | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_replies: {
        Row: {
          camly_earned: number | null
          content: string
          created_at: string | null
          id: string
          is_green_reply: boolean | null
          story_id: string
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_green_reply?: boolean | null
          story_id: string
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_green_reply?: boolean | null
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_replies_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_replies_user_id_fkey"
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
      typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_user_id_fkey"
            columns: ["user_id"]
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
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
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
      user_habit_completions: {
        Row: {
          camly_earned: number | null
          completed_date: string
          created_at: string | null
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          camly_earned?: number | null
          completed_date?: string
          created_at?: string | null
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          camly_earned?: number | null
          completed_date?: string
          created_at?: string | null
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "daily_habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_habit_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_online_status: {
        Row: {
          is_online: boolean | null
          last_seen: string | null
          show_status: boolean | null
          user_id: string
        }
        Insert: {
          is_online?: boolean | null
          last_seen?: string | null
          show_status?: boolean | null
          user_id: string
        }
        Update: {
          is_online?: boolean | null
          last_seen?: string | null
          show_status?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_online_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      user_quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          percentage: number | null
          points_earned: number | null
          quiz_id: string
          score: number
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          percentage?: number | null
          points_earned?: number | null
          quiz_id: string
          score?: number
          time_taken_seconds?: number | null
          total_questions?: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          percentage?: number | null
          points_earned?: number | null
          quiz_id?: string
          score?: number
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_attempts_user_id_fkey"
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
      waste_scans: {
        Row: {
          bin_color: string | null
          disposal_instructions: string | null
          disposal_instructions_vi: string | null
          environmental_note: string | null
          environmental_note_vi: string | null
          id: string
          image_url: string
          material: string | null
          points_earned: number | null
          recyclable: boolean | null
          reuse_suggestions: Json | null
          scanned_at: string | null
          user_id: string
          waste_type: string | null
          waste_type_vi: string | null
        }
        Insert: {
          bin_color?: string | null
          disposal_instructions?: string | null
          disposal_instructions_vi?: string | null
          environmental_note?: string | null
          environmental_note_vi?: string | null
          id?: string
          image_url: string
          material?: string | null
          points_earned?: number | null
          recyclable?: boolean | null
          reuse_suggestions?: Json | null
          scanned_at?: string | null
          user_id: string
          waste_type?: string | null
          waste_type_vi?: string | null
        }
        Update: {
          bin_color?: string | null
          disposal_instructions?: string | null
          disposal_instructions_vi?: string | null
          environmental_note?: string | null
          environmental_note_vi?: string | null
          id?: string
          image_url?: string
          material?: string | null
          points_earned?: number | null
          recyclable?: boolean | null
          reuse_suggestions?: Json | null
          scanned_at?: string | null
          user_id?: string
          waste_type?: string | null
          waste_type_vi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waste_scans_user_id_fkey"
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
      are_friends: { Args: { user1: string; user2: string }; Returns: boolean }
      create_direct_conversation: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_conversation_other_user: {
        Args: { conv_id: string; current_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_call_log_message: {
        Args: {
          p_call_id: string
          p_call_status: string
          p_call_type: string
          p_callee_id: string
          p_caller_id: string
          p_duration_seconds: number
        }
        Returns: undefined
      }
      is_blocked: { Args: { user1: string; user2: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { conv_id: string; u_id: string }
        Returns: boolean
      }
      transfer_camly_coins: {
        Args: { p_amount: number; p_receiver_id: string; p_sender_id: string }
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
