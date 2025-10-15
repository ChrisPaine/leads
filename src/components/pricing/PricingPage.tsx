import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Loader2, ArrowLeft, Lightbulb } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCreditPack, setIsLoadingCreditPack] = useState(false)
  const { user, session, isPro, isPremium, isEnterprise, isAdmin, subscriptionStatus } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const PRICE_IDS = {
    starter: 'price_1SDS1pGbEY7eE6CcwMAsIKOH', // $14.99/mo - UPDATE THIS IN STRIPE
    professional: 'price_1SDS49GbEY7eE6Ccl7s1I9s7', // $29.99/mo - UPDATE THIS IN STRIPE
    agency: 'price_1SDS4KGbEY7eE6Cc4tJxYbcj', // $49.99/mo - UPDATE THIS IN STRIPE
    creditPack: 'price_1SDS5MGbEY7eE6Cc6Dgd3ovB' // $4.99 one-time
  }

  // Determine current plan based on subscription
  const getCurrentPlan = () => {
    if (!subscriptionStatus) return null
    // You'll need to update this logic based on how you store plan types
    // This is a placeholder - adjust based on your actual subscription data structure
    if (subscriptionStatus === 'starter') return 'starter'
    if (subscriptionStatus === 'professional') return 'professional'
    if (subscriptionStatus === 'agency' || isPro) return 'agency'
    return null
  }

  const currentPlan = getCurrentPlan()

  const plans = [
    {
      name: 'Starter',
      price: '$14.99',
      period: 'month',
      description: 'Perfect for testing multiple ideas',
      useCase: 'Access to 3 platforms',
      features: [
        'Access to 3 platforms (Reddit, YouTube, Twitter)',
        '100 searches per month',
        'Basic query builder',
        'Pain point phrase presets',
        'Email support',
      ],
      priceId: PRICE_IDS.starter,
      popular: false,
      current: currentPlan === 'starter',
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: 'month',
      description: 'For serious market researchers',
      useCase: 'Most flexible option',
      features: [
        'Access to 6 platforms (+LinkedIn, Facebook, TikTok)',
        '500 searches per month',
        'Advanced filters & operators',
        'Save & organize queries',
        'Search history access',
        'Report functionality',
        'Priority support',
      ],
      priceId: PRICE_IDS.professional,
      popular: true,
      current: currentPlan === 'professional',
    },
    {
      name: 'Agency',
      price: '$49.99',
      period: 'month',
      description: 'Unlimited research across all platforms',
      useCase: 'Full platform access',
      features: [
        'All 11 platforms included',
        'Unlimited searches',
        'Save & organize queries',
        'Advanced platform operators',
        'Report functionality',
        'MVP creation',
        'Landing page creation',
        'Priority email support',
        'Cancel anytime',
      ],
      priceId: PRICE_IDS.agency,
      popular: false,
      current: currentPlan === 'agency',
    },
  ]

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      })
      navigate('/auth')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreditPackPurchase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase credit pack.",
      })
      navigate('/auth')
      return
    }

    setIsLoadingCreditPack(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: PRICE_IDS.creditPack,
          mode: 'payment' // One-time payment instead of subscription
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCreditPack(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Research Tool
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with focused platform research or unlock the full power of multi-platform insights. 
            Find real customer pain points and build winning products.
          </p>
        </div>
        
        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${plan.current ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              {plan.current && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="text-center">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full h-12 font-semibold"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading || plan.current}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : plan.current ? (
                    'Current Plan'
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* One-Time Purchase Card */}
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-medium">OR</span>
            </div>
          </div>

          <Card className="relative border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20 dark:to-background hover:shadow-xl transition-all duration-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl mb-2">One-Time Purchase</CardTitle>
              <div className="mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  $4.99
                </span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <CardDescription className="text-center">Need just a few searches?</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">10 one-time searches</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Basic query builder</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Pain point phrase presets</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Email support</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-center text-muted-foreground">
                      Perfect for testing the tool before committing to a subscription
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={handleCreditPackPurchase}
                    disabled={isLoadingCreditPack}
                  >
                    {isLoadingCreditPack ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Get 10 Searches'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    No subscription required
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}