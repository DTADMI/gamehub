export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      app_admins: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      resume_sections: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content_html: string;
          sort_order: number;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content_html: string;
          sort_order?: number;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content_html?: string;
          sort_order?: number;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content_html: string;
          status: string;
          published_at: string | null;
          tags: string[] | null;
          featured: boolean;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content_html: string;
          status?: string;
          published_at?: string | null;
          tags?: string[] | null;
          featured?: boolean;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content_html?: string;
          status?: string;
          published_at?: string | null;
          tags?: string[] | null;
          featured?: boolean;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      feature_flags: {
        Row: {
          path: string;
          value: Json;
          is_sensitive: boolean;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          path: string;
          value: Json;
          is_sensitive?: boolean;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          path?: string;
          value?: Json;
          is_sensitive?: boolean;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      feature_flag_audit: {
        Row: {
          id: string;
          flag_path: string;
          old_value: Json | null;
          new_value: Json | null;
          actor_user_id: string | null;
          actor_role: string;
          request_ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          flag_path: string;
          old_value?: Json | null;
          new_value?: Json | null;
          actor_user_id?: string | null;
          actor_role: string;
          request_ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          flag_path?: string;
          old_value?: Json | null;
          new_value?: Json | null;
          actor_user_id?: string | null;
          actor_role?: string;
          request_ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      leaderboard_seasons: {
        Row: {
          id: string;
          slug: string;
          name: string;
          starts_at: string;
          ends_at: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          starts_at: string;
          ends_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          starts_at?: string;
          ends_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      leaderboard_scores: {
        Row: {
          id: string;
          user_id: string;
          player_name: string;
          game_type: string;
          score: number;
          season_id: string | null;
          metadata: Json;
          client_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          player_name: string;
          game_type: string;
          score: number;
          season_id?: string | null;
          metadata?: Json;
          client_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          player_name?: string;
          game_type?: string;
          score?: number;
          season_id?: string | null;
          metadata?: Json;
          client_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_leaderboard: {
        Args: {
          p_game_type: string;
          p_limit?: number;
          p_season_slug?: string | null;
        };
        Returns: {
          rank: number;
          user_id: string;
          player_name: string;
          score: number;
          submitted_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
