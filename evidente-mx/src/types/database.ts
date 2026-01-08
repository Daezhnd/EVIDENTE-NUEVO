// Tipos generados para la base de datos de Supabase
// Evidente.mx - Portal de Noticias

export type ArticleCategory = 'Destacadas' | 'Internacionales' | 'Entretenimiento' | 'Noticias' | 'Deportes' | 'Turismo';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  content?: string;
  image_url: string | null;
  video_url?: string;
  category?: Category | ArticleCategory;
  author?: Author;
  author_id?: string | null;
  is_featured?: boolean;
  is_published: boolean;
  views?: number;
  views_count?: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithAuthor extends Article {
  author_name?: string;
  author_avatar?: string;
}

export interface Reel {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  description?: string | null;
  caption?: string | null;
  author?: Author;
  author_id?: string | null;
  duration?: number;
  is_published: boolean;
  views?: number;
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReelWithAuthor extends Reel {
  author_name?: string;
}

// Tipos para las respuestas de Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views_count'>;
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>;
      };
      reels: {
        Row: Reel;
        Insert: Omit<Reel, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count'>;
        Update: Partial<Omit<Reel, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      public_articles: {
        Row: ArticleWithAuthor;
      };
      public_reels: {
        Row: ReelWithAuthor;
      };
    };
    Enums: {
      article_category: ArticleCategory;
      user_role: UserRole;
    };
  };
}

// Tipos para paginación
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipos para filtros de artículos
export interface ArticleFilters {
  category?: ArticleCategory;
  search?: string;
  limit?: number;
}
