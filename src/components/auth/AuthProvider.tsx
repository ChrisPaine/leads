import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface Profile {
  id: string
  email: string
  full_name?: string
  subscription_status: 'free' | 'starter' | 'professional' | 'agency' | 'pro' | 'premium' | 'enterprise' | 'admin'
  stripe_customer_id?: string
  search_credits?: number
  monthly_searches_used?: number
  search_quota_reset_date?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<void>
  resendVerification: (email: string) => Promise<any>
  isPro: boolean
  isPremium: boolean
  isEnterprise: boolean
  isAdmin: boolean
  isSupabaseConnected: boolean
  subscriptionStatus: {
    subscribed: boolean
    product_id: string | null
    subscription_end: string | null
  }
  subscriptionTier: string | null
  searchCredits: number
  monthlySearchesUsed: number
  monthlySearchLimit: number
  monthlySearchesRemaining: number
  searchQuotaResetDate: string | null
  checkSubscription: () => Promise<void>
  decrementCredit: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean
    product_id: string | null
    subscription_end: string | null
  }>({ subscribed: false, product_id: null, subscription_end: null })
  
  const isSupabaseConnected = true

  useEffect(() => {
    // Handle auth errors present in URL hash (e.g., expired email link)
    try {
      const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
      const params = new URLSearchParams(rawHash)
      const errorCode = params.get('error_code')
      const error = params.get('error')
      const type = params.get('type')
      
      // Handle email confirmation success
      if (type === 'signup' && !errorCode && !error) {
        console.log('Email confirmation detected')
        // Mark this as a fresh signup confirmation
        sessionStorage.setItem('fresh_signup_confirmation', 'true')
      }
      
      if (errorCode === 'otp_expired' || error === 'access_denied') {
        sessionStorage.setItem('auth_error', errorCode || error || 'unknown')
        // Navigate to Auth page (HashRouter)
        window.location.hash = '#/auth'
      }
    } catch (e) {
      console.warn('Failed to parse auth hash', e)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No user')
      setSession(session)
      setUser(session?.user ?? null)

      // Clean up auth tokens from hash to play nice with HashRouter
      try {
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.slice(1)
          const hasTokens = hash.includes('access_token') || hash.includes('refresh_token') || hash.includes('type=signup')
          if (hasTokens) {
            const newUrl = window.location.origin + window.location.pathname + '#/'
            window.history.replaceState({}, document.title, newUrl)
          }
        }
      } catch (e) {
        console.warn('Failed to clean auth hash', e)
      }

      if (session?.user) {
        fetchProfile(session.user.id)
        setTimeout(() => checkSubscription(), 0)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // If user just signed in (email confirmation or password), set a flag for welcome upgrade
      if (event === 'SIGNED_IN' && session?.user) {
        // Only auto-prompt if it's likely a first-time visit on this device
        const visited = localStorage.getItem(`user-visited-${session.user.id}`)
        if (!visited) {
          sessionStorage.setItem('fresh_signup_confirmation', 'true')
        }
      }

      // Clean up auth tokens from hash after sign-in
      try {
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.slice(1)
          const hasTokens = hash.includes('access_token') || hash.includes('refresh_token') || hash.includes('type=signup')
          if (hasTokens) {
            const newUrl = window.location.origin + window.location.pathname + '#/'
            window.history.replaceState({}, document.title, newUrl)
          }
        }
      } catch (e) {
        console.warn('Failed to clean auth hash (auth change)', e)
      }

      if (session?.user) {
        fetchProfile(session.user.id)
        setTimeout(() => checkSubscription(), 0)
      } else {
        setProfile(null)
        setSubscriptionStatus({ subscribed: false, product_id: null, subscription_end: null })
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      // Profile doesn't exist, create it
      const { error: insertError, data: insertData } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: session?.user?.email,
          subscription_status: 'free',
          search_credits: 3, // default value
          monthly_searches_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        setProfile(insertData as Profile);
      }
    } else {
      setProfile(data as Profile);
    }
  } catch (error) {
    console.error('Error fetching/creating profile:', error);
  } finally {
    setLoading(false);
  }
}

  const checkSubscription = async () => {
    if (!session) {
      console.log('No session available for subscription check')
      return
    }
    
    try {
      console.log('Checking subscription status...')
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (error) {
        console.error('Error checking subscription:', error)
        return
      }
      
      console.log('Subscription status updated:', data)
      setSubscriptionStatus(data)
      
      // Also refresh the profile to sync any database changes
      if (user?.id) {
        fetchProfile(user.id)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Use production domain for email redirects
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'https://www.painpointresearch.com/'
      : `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSubscriptionStatus({ subscribed: false, product_id: null, subscription_end: null })
  }

  const resendVerification = async (email: string) => {
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'https://www.painpointresearch.com/'
      : `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    return { data, error }
  }

  // Calculate subscription status - Product IDs from Stripe (matching pricing page)
  const PRODUCT_IDS = {
    starter: 'price_1SDS1pGbEY7eE6CcwMAsIKOH',  // $9.99/mo
    professional: 'price_1SDS49GbEY7eE6Ccl7s1I9s7', // $19.99/mo
    agency: 'price_1SDS4KGbEY7eE6Cc4tJxYbcj', // $29.99/mo (previously "pro")
    premium: null // Legacy - map to professional
  }

  // Normalize tier from profile to avoid case issues
  const tier = (profile?.subscription_status || '').toString().toLowerCase().trim()

  // Determine subscription tier based on product ID or profile tier
  let subscriptionTier: string | null = null
  if (subscriptionStatus.product_id === PRODUCT_IDS.agency) {
    subscriptionTier = 'agency'
  } else if (subscriptionStatus.product_id === PRODUCT_IDS.professional) {
    subscriptionTier = 'professional'
  } else if (subscriptionStatus.product_id === PRODUCT_IDS.starter) {
    subscriptionTier = 'starter'
  } else if (tier === 'pro' || tier === 'agency') {
    subscriptionTier = 'agency'
  } else if (tier === 'premium' || tier === 'professional') {
    subscriptionTier = 'professional'
  } else if (tier === 'starter') {
    subscriptionTier = 'starter'
  }

  // Check subscription status - Enterprise and Admin users get Agency access
  const isEnterprise = tier === 'enterprise'
  const isAdmin = tier === 'admin'
  const isPremium = subscriptionTier === 'professional' || tier === 'premium'
  const isPro = subscriptionTier === 'agency' || tier === 'pro' || isEnterprise || isAdmin

  // Get search credits from profile
  const searchCredits = profile?.search_credits || 0

  // Calculate monthly search limit based on tier
  const getMonthlyLimit = (tier: string | null): number => {
    switch (tier) {
      case 'starter':
        return 100
      case 'professional':
      case 'premium':
        return 500
      case 'agency':
      case 'pro':
      case 'enterprise':
      case 'admin':
        return 999999 // Unlimited
      default:
        return 0 // Free tier uses daily limits
    }
  }

  const monthlySearchLimit = getMonthlyLimit(subscriptionTier || tier)
  const monthlySearchesUsed = profile?.monthly_searches_used || 0
  const monthlySearchesRemaining = Math.max(0, monthlySearchLimit - monthlySearchesUsed)
  const searchQuotaResetDate = profile?.search_quota_reset_date || null

  // Function to decrement search credit
  const decrementCredit = async (): Promise<boolean> => {
    if (!user || !profile) return false

    const currentCredits = profile.search_credits || 0
    if (currentCredits <= 0) return false

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ search_credits: currentCredits - 1 })
        .eq('id', user.id)

      if (error) {
        console.error('Error decrementing credit:', error)
        return false
      }

      // Update local profile state
      setProfile({ ...profile, search_credits: currentCredits - 1 })
      return true
    } catch (error) {
      console.error('Error decrementing credit:', error)
      return false
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resendVerification,
    isPro,
    isPremium,
    isEnterprise,
    isAdmin,
    subscriptionStatus,
    subscriptionTier,
    searchCredits,
    monthlySearchesUsed,
    monthlySearchLimit,
    monthlySearchesRemaining,
    searchQuotaResetDate,
    checkSubscription,
    decrementCredit,
    isSupabaseConnected,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}