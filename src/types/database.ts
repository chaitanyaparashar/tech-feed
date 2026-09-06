export type ProductSource = 'hacker_news' | 'product_hunt' | 'tech_news';

export interface Product {
  id: string;
  title: string;
  tagline: string;
  source: ProductSource;
  url: string;
  buzz_score: number;
  votes: number;
  comments: number;
  news_mentions: number;
  created_at: string;
}

export interface IngestRun {
  id: string;
  source: ProductSource;
  status: 'completed' | 'running' | 'failed';
  items_ingested: number;
  completed_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  profile_picture_url: string;
  interests: string[];
  avatar_concept?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductLike {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Drawer {
  id: string;
  user_id: string;
  name: string;
  is_default?: boolean;
  created_at: string;
}

export interface DrawerItem {
  id: string;
  drawer_id: string;
  product_id: string;
  saved_at: string;
}

export type FeedbackCategory = 'bug' | 'feature request' | 'product suggestion' | 'general feedback';

export interface Feedback {
  id: string;
  user_id?: string;
  message: string;
  rating?: number;
  category?: FeedbackCategory;
  created_at: string;
}
