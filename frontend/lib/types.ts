export interface ProductFeature {
  icon: 'shield' | 'globe' | 'zap' | 'lock' | 'wallet' | 'credit-card' | 'clock' | 'percent' | 'smartphone';
  title: string;
  desc: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  desc: string;
  badge: string;
  badgeColors: string;
  tag: string;
  gradient: string;
  deliveryTime: string;
  lto: boolean;
  fullDesc: string;
  features: ProductFeature[];
  img?: string;
}

export interface PromoStatus {
  valid: boolean;
  message: string;
  discount_amount?: number;
  discount_type?: string;
}

export interface Order {
  id: number;
  bank_id: string;
  full_name: string;
  tg_username: string;
  price: number;
  status: string;
  created_at: string;
}

export interface ReferralStats {
  invited_count: number;
  confirmed_count: number;
  earnings: number;
}

export type TabId = 'home' | 'orders' | 'bonuses' | 'settings';
