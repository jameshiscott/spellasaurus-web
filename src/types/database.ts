// Auto-generated Supabase types — regenerate with: npm run db:types
// Manually maintained until local Supabase is running.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    PostgrestVersion: "12"
    Tables: {
      users: {
        Row: {
          id: string
          role: 'school_admin' | 'teacher' | 'parent' | 'child'
          full_name: string
          email: string
          date_of_birth: string | null
          coin_balance: number
          display_name: string | null
          dino_type: string | null
          dino_color: string | null
          onboarding_complete: boolean
          school_id: string | null
          avatar_loadout: Json | null
          leaderboard_opt_in: boolean
          last_seen_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: 'school_admin' | 'teacher' | 'parent' | 'child'
          full_name: string
          email: string
          date_of_birth?: string | null
          coin_balance?: number
          display_name?: string | null
          dino_type?: string | null
          dino_color?: string | null
          onboarding_complete?: boolean
          school_id?: string | null
          avatar_loadout?: Json | null
          leaderboard_opt_in?: boolean
          last_seen_version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'school_admin' | 'teacher' | 'parent' | 'child'
          full_name?: string
          email?: string
          date_of_birth?: string | null
          coin_balance?: number
          display_name?: string | null
          dino_type?: string | null
          dino_color?: string | null
          onboarding_complete?: boolean
          school_id?: string | null
          avatar_loadout?: Json | null
          leaderboard_opt_in?: boolean
          last_seen_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          id: string
          name: string
          address: string | null
          admin_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          admin_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          admin_ids?: string[]
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          school_id: string
          teacher_id: string | null
          name: string
          school_year: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          teacher_id?: string | null
          name: string
          school_year: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          teacher_id?: string | null
          name?: string
          school_year?: string
        }
        Relationships: [
          {
            foreignKeyName: 'classes_school_id_fkey'
            columns: ['school_id']
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_teacher_id_fkey'
            columns: ['teacher_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      spelling_sets: {
        Row: {
          id: string
          name: string
          class_id: string | null
          created_by: string
          week_start: string
          week_number: number
          type: 'class' | 'personal'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          class_id?: string | null
          created_by: string
          week_start: string
          week_number: number
          type: 'class' | 'personal'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          class_id?: string | null
          created_by?: string
          week_start?: string
          week_number?: number
          type?: 'class' | 'personal'
        }
        Relationships: [
          {
            foreignKeyName: 'spelling_sets_class_id_fkey'
            columns: ['class_id']
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'spelling_sets_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      spelling_words: {
        Row: {
          id: string
          set_id: string
          word: string
          hint: string | null
          ai_description: string | null
          ai_example_sentence: string | null
          ai_sentence_with_blank: string | null
          audio_url: string | null
          ai_generated_at: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          set_id: string
          word: string
          hint?: string | null
          ai_description?: string | null
          ai_example_sentence?: string | null
          ai_sentence_with_blank?: string | null
          audio_url?: string | null
          ai_generated_at?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          set_id?: string
          word?: string
          hint?: string | null
          ai_description?: string | null
          ai_example_sentence?: string | null
          ai_sentence_with_blank?: string | null
          audio_url?: string | null
          ai_generated_at?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'spelling_words_set_id_fkey'
            columns: ['set_id']
            referencedRelation: 'spelling_sets'
            referencedColumns: ['id']
          }
        ]
      }
      practice_sessions: {
        Row: {
          id: string
          child_id: string
          set_id: string
          correct_count: number
          total_words: number
          coins_awarded: number
          time_taken_ms: number
          word_results: Json
          completed_at: string
        }
        Insert: {
          id?: string
          child_id: string
          set_id: string
          correct_count: number
          total_words: number
          coins_awarded: number
          time_taken_ms: number
          word_results?: Json
          completed_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          set_id?: string
          correct_count?: number
          total_words?: number
          coins_awarded?: number
          time_taken_ms?: number
          word_results?: Json
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'practice_sessions_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'practice_sessions_set_id_fkey'
            columns: ['set_id']
            referencedRelation: 'spelling_sets'
            referencedColumns: ['id']
          }
        ]
      }
      child_practice_settings: {
        Row: {
          id: string
          child_id: string
          play_tts_audio: boolean
          show_description: boolean
          show_example_sentence: boolean
          leaderboard_opt_in: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          play_tts_audio?: boolean
          show_description?: boolean
          show_example_sentence?: boolean
          leaderboard_opt_in?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          play_tts_audio?: boolean
          show_description?: boolean
          show_example_sentence?: boolean
          leaderboard_opt_in?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'child_practice_settings_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      parent_children: {
        Row: {
          id: string
          parent_id: string
          child_id: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_id: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          child_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'parent_children_parent_id_fkey'
            columns: ['parent_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'parent_children_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      class_students: {
        Row: {
          id: string
          class_id: string
          child_id: string
          school_id: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          child_id: string
          school_id: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          child_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'class_students_class_id_fkey'
            columns: ['class_id']
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'class_students_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      child_personal_sets: {
        Row: {
          id: string
          child_id: string
          set_id: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          set_id: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'child_personal_sets_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'child_personal_sets_set_id_fkey'
            columns: ['set_id']
            referencedRelation: 'spelling_sets'
            referencedColumns: ['id']
          }
        ]
      }
      shop_items: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          slot: string
          price_coins: number
          rarity: string
          asset_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          slot: string
          price_coins: number
          rarity?: string
          asset_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          slot?: string
          price_coins?: number
          rarity?: string
          asset_url?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      child_inventory: {
        Row: {
          id: string
          child_id: string
          item_id: string
          purchased_at: string
          purchase_price_coins: number
        }
        Insert: {
          id?: string
          child_id: string
          item_id: string
          purchased_at?: string
          purchase_price_coins: number
        }
        Update: {
          id?: string
          child_id?: string
          item_id?: string
          purchased_at?: string
          purchase_price_coins?: number
        }
        Relationships: [
          {
            foreignKeyName: 'child_inventory_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'child_inventory_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'shop_items'
            referencedColumns: ['id']
          }
        ]
      }
      coin_transactions: {
        Row: {
          id: string
          child_id: string
          type: string
          amount: number
          balance_after: number
          related_session_id: string | null
          related_item_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          type: string
          amount: number
          balance_after: number
          related_session_id?: string | null
          related_item_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          type?: string
          amount?: number
          balance_after?: number
          related_session_id?: string | null
          related_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'coin_transactions_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      child_stats: {
        Row: {
          id: string
          child_id: string
          total_sessions: number
          total_words: number
          total_correct: number
          average_time_ms: number
          weekly_coins: number
          monthly_coins: number
          current_streak: number
          best_streak: number
          last_practised_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          total_sessions?: number
          total_words?: number
          total_correct?: number
          average_time_ms?: number
          weekly_coins?: number
          monthly_coins?: number
          current_streak?: number
          best_streak?: number
          last_practised_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          total_sessions?: number
          total_words?: number
          total_correct?: number
          average_time_ms?: number
          weekly_coins?: number
          monthly_coins?: number
          current_streak?: number
          best_streak?: number
          last_practised_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'child_stats_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      class_leaderboard_stats: {
        Row: {
          id: string
          class_id: string
          child_id: string
          school_id: string
          display_name: string
          avatar_snapshot: Json | null
          leaderboard_eligible: boolean
          weekly_coins: number
          total_coins: number
          weekly_words: number
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          child_id: string
          school_id: string
          display_name: string
          avatar_snapshot?: Json | null
          leaderboard_eligible?: boolean
          weekly_coins?: number
          total_coins?: number
          weekly_words?: number
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          child_id?: string
          school_id?: string
          display_name?: string
          avatar_snapshot?: Json | null
          leaderboard_eligible?: boolean
          weekly_coins?: number
          total_coins?: number
          weekly_words?: number
          updated_at?: string
        }
        Relationships: []
      }
      school_leaderboard_stats: {
        Row: {
          id: string
          school_id: string
          child_id: string
          display_name: string
          avatar_snapshot: Json | null
          leaderboard_eligible: boolean
          weekly_coins: number
          total_coins: number
          weekly_words: number
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          child_id: string
          display_name: string
          avatar_snapshot?: Json | null
          leaderboard_eligible?: boolean
          weekly_coins?: number
          total_coins?: number
          weekly_words?: number
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          child_id?: string
          display_name?: string
          avatar_snapshot?: Json | null
          leaderboard_eligible?: boolean
          weekly_coins?: number
          total_coins?: number
          weekly_words?: number
          updated_at?: string
        }
        Relationships: []
      }
      global_leaderboard_stats: {
        Row: {
          id: string
          child_id: string
          display_name: string
          avatar_snapshot: Json | null
          leaderboard_eligible: boolean
          weekly_coins: number
          total_coins: number
          weekly_words: number
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          display_name: string
          avatar_snapshot?: Json | null
          leaderboard_eligible?: boolean
          weekly_coins?: number
          total_coins?: number
          weekly_words?: number
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          display_name?: string
          avatar_snapshot?: Json | null
          leaderboard_eligible?: boolean
          weekly_coins?: number
          total_coins?: number
          weekly_words?: number
          updated_at?: string
        }
        Relationships: []
      }
      arcade_games: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          thumbnail_url: string | null
          price_coins: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          thumbnail_url?: string | null
          price_coins?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          price_coins?: number
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      arcade_unlocks: {
        Row: {
          id: string
          child_id: string
          game_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          child_id: string
          game_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          game_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'arcade_unlocks_child_id_fkey'
            columns: ['child_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'arcade_unlocks_game_id_fkey'
            columns: ['game_id']
            referencedRelation: 'arcade_games'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_spelling_session: {
        Args: {
          p_child_id: string
          p_set_id: string
          p_correct_count: number
          p_total_words: number
          p_time_taken_ms: number
          p_coins_earned: number
        }
        Returns: {
          session_id: string
          coins_earned: number
          new_balance: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: { [_ in never]: never }
    Views: { [_ in never]: never }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
