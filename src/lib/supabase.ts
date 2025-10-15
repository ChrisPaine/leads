import { supabase as supabaseClient } from '@/integrations/supabase/client'

// Re-export the configured Supabase client used across the app
export const supabase = supabaseClient

export type Profile = {
  id: string
  email: string
  full_name?: string
  subscription_status: 'free' | 'pro' | 'premium' | 'enterprise' | 'admin'
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export type SavedQuery = {
  id: string
  user_id: string
  title: string
  query_data: any
  platforms: string[]
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: string
  price_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}