/**
 * 后台管理 API 客户端
 */

import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// @ts-ignore - Vite environment variables
const API_BASE = import.meta.env?.VITE_API_URL || '/.netlify/functions';

// Auth API - 独立 endpoint
const AUTH_URL = `${API_BASE.replace('/api', '')}/auth`;

// Admin APIs - 独立 endpoint (Netlify functions use hyphen for subdirectories)
const NETLIFY_FUNCTIONS = API_BASE.replace('/api', '');
const ARTICLES_URL = `${NETLIFY_FUNCTIONS}/api-admin-articles`;
const SENTENCES_URL = `${NETLIFY_FUNCTIONS}/api-admin-sentences`;
const TAGS_URL = `${NETLIFY_FUNCTIONS}/api-admin-tags`;
const STATISTICS_URL = `${NETLIFY_FUNCTIONS}/api-admin-statistics`;

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.config.url);
    return response.data;
  },
  (error) => {
    console.error('[API] Error:', error.config?.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============ Auth API ============

export const authApi = {
  login: (email: string, password: string) =>
    api.post(AUTH_URL, { email, password }),
  
  logout: () => api.post(AUTH_URL, { action: 'logout' }),
  
  me: () => api.get(AUTH_URL),
};

// ============ Articles API ============

export const articlesApi = {
  list: (params?: Record<string, any>) =>
    api.get(`${ARTICLES_URL}/articles`, { params }),
  
  get: (id: number) =>
    api.get(`${ARTICLES_URL}/articles/${id}`),
  
  create: (data: CreateArticleData) =>
    api.post(`${ARTICLES_URL}/articles`, data),
  
  update: (id: number, data: any) =>
    api.put(`${ARTICLES_URL}/articles/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`${ARTICLES_URL}/articles/${id}`),
  
  importSentences: (id: number, data: any) =>
    api.post(`${ARTICLES_URL}/articles/${id}/sentences/batch`, data),
  
  reorderSentences: (id: number, mappings: any[]) =>
    api.put(`${ARTICLES_URL}/articles/${id}/sentences/reorder`, { mappings }),
  
  importJson: (articles: any[]) =>
    api.post(`${ARTICLES_URL}/articles/import/json`, { articles }),
};

// ============ Sentences API ============

export const sentencesApi = {
  get: (id: number) =>
    api.get(`${SENTENCES_URL}/sentences/${id}`),

  update: (id: number, data: any) =>
    api.put(`${SENTENCES_URL}/sentences/${id}`, data),

  delete: (id: number) =>
    api.delete(`${SENTENCES_URL}/sentences/${id}`),

  batchUpdate: (sentences: any[]) =>
    api.put(`${SENTENCES_URL}/sentences/batch`, { sentences }),

  batchDelete: (ids: number[]) =>
    api.delete(`${SENTENCES_URL}/sentences/batch`, { data: { ids } }),
};

// ============ Tags API ============

export const tagsApi = {
  list: () => api.get(`${TAGS_URL}/tags`),

  create: (data: { name: string; color?: string }) =>
    api.post(`${TAGS_URL}/tags`, data),

  update: (id: number, data: { name?: string; color?: string }) =>
    api.put(`${TAGS_URL}/tags/${id}`, data),

  delete: (id: number) =>
    api.delete(`${TAGS_URL}/tags/${id}`),

  addToArticle: (articleId: number, tagId: number) =>
    api.post(`${TAGS_URL}/tags/article`, { article_id: articleId, tag_id: tagId }),

  removeFromArticle: (articleId: number, tagId: number) =>
    api.delete(`${TAGS_URL}/tags/article`, { data: { article_id: articleId, tag_id: tagId } }),
};

// ============ Statistics API ============

export const statisticsApi = {
  get: () => api.get(`${STATISTICS_URL}/statistics`),
};

// ============ Types ============

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface Article {
  id: number;
  title: string;
  description: string | null;
  source_url: string | null;
  source_type: string;
  cover_image: string | null;
  total_sentences: number;
  metadata: Record<string, any>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithSentences extends Article {
  sentences: Sentence[];
  tags: Tag[];
}

export interface Sentence {
  id: number;
  article_id: number;
  content: string;
  sequence_order: number;
  extensions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  article_count?: number;
  created_at?: string;
}

export interface Statistics {
  overview: {
    total_articles: number;
    total_sentences: number;
    published_articles: number;
    draft_articles: number;
  };
  by_source_type: { source_type: string; count: number }[];
  by_difficulty: { difficulty: number; count: number }[];
  recent_activity: {
    articles_created_last_week: number;
    sentences_added_last_week: number;
    last_updated: string | null;
  };
  recent_articles: { id: number; title: string; updated_at: string }[];
  top_tags: { id: number; name: string; count: number }[];
}

// Create Article Data Type
export interface CreateArticleData {
  title: string;
  description?: string;
  source_type: string;
  is_published: boolean;
  sentences?: Array<{
    content: string;
    sequence_order: number;
    extensions?: Record<string, any>;
  }>;
  source_url?: string | null;
  cover_image?: string | null;
  metadata?: Record<string, any>;
}

export default api;
