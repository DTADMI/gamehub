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
      };
    };
  };
};
