// API Types
export interface SiteImage {
  id: number;
  category: string;
  filename: string;
  original_name: string;
  path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export interface ContactSettings {
  company_name: string;
  company_tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address_fr: string;
  address_en: string;
  hours_fr: string;
  hours_en: string;
  hours_detailed_fr: string;
  hours_detailed_en: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}