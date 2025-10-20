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
    starter: 'price_1SDS1pGbEY7eE6CcwMAsIKOH', // $29/mo - UPDATE THIS IN STRIPE
    professional: 'price_1SDS49GbEY7eE6Ccl7s1I9s7', // $49/mo - UPDATE THIS IN STRIPE
    agency: 'price_1SDS4KGbEY7eE6Cc4tJxYbcj', // $99/mo - UPDATE THIS IN STRIPE
    creditPack: 'price_1SDS5MGbEY7eE6Cc6Dgd3ovB' // $9.99 one-time
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
      price: '$29',
      period: 'month',
      description: 'Pain point analysis for content creators',
      useCase: 'For Content Creators & Marketers',
      reportType: 'Summary Reports Only',
      features: [
        '50 searches per month across all 11 platforms',
        'Summary Reports with pain point analysis',
        'Real user quotes from Reddit, Twitter, Facebook & more',
        'Perfect for blog topics, YouTube videos & social content',
        'Pain point phrase presets',
        'Export to CSV/PDF',
        'Email support',
      ],
      priceId: PRICE_IDS.starter,
      popular: false,
      current: currentPlan === 'starter',
      highlight: 'Get validated content ideas backed by real user pain points',
    },
    {
      name: 'Professional',
      price: '$49',
      period: 'month',
      description: 'MVP Builder with code templates',
      useCase: 'For Solo Founders & Indie Hackers',
      reportType: 'MVP Builder Reports',
      features: [
        '150 searches per month across all 11 platforms',
        'MVP Builder Reports with AI product specs',
        'Working MVP code templates (Replit/Lovable ready)',
        'Get 80% complete MVP in 17-30 minutes',
        'Full pain point analysis with user quotes',
        'Product validation framework',
        'Save & organize research',
        'Priority support',
      ],
      priceId: PRICE_IDS.professional,
      popular: true,
      current: currentPlan === 'professional',
      highlight: 'Turn customer pain into working code in under 30 minutes',
    },
    {
      name: 'Agency',
      price: '$99',
      period: 'month',
      description: 'Unlimited MVP creation for agencies',
      useCase: 'For Agencies & Serial Builders',
      reportType: 'All Features Unlimited',
      features: [
        'Unlimited searches across all 11 platforms',
        'Unlimited MVP Builder Reports',
        'Multiple projects & client accounts',
        'White-label capabilities',
        'Advanced platform operators & filters',
        'Team collaboration features',
        'Custom pain point categories',
        'Dedicated priority support',
        'Cancel anytime',
      ],
      priceId: PRICE_IDS.agency,
      popular: false,
      current: currentPlan === 'agency',
      highlight: 'Scale your MVP factory with unlimited projects',
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
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Turn Customer Pain Into Working MVPs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Search 11 platforms for real pain points, get AI product specs with user quotes,
            and generate 80% complete MVP code in 17-30 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">11 Platforms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Real User Quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Working Code Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">17-30 Min Generation</span>
            </div>
          </div>
        </div>
        
        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'border-primary shadow-lg scale-105 border-2' : ''
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

              <CardHeader className="text-center pb-6 space-y-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{plan.useCase}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-lg">/{plan.period}</span>
                </div>
                <div className="space-y-2">
                  <CardDescription className="text-center text-base font-medium">{plan.description}</CardDescription>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary">{plan.reportType}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Value Highlight */}
                <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                  <p className="text-sm font-medium text-foreground">{plan.highlight}</p>
                </div>

                <ul className="space-y-3">
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
                    `Get Started`
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
                  $9.99
                </span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <CardDescription className="text-center">Try before you subscribe</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">5 searches with full reports</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Access to all 11 platforms</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">MVP Builder Reports included</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Code templates & product specs</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Email support</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-center font-medium text-blue-900 dark:text-blue-100">
                      Test the full MVP Builder before subscribing
                    </p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Build 1-2 complete MVPs to see the power
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
                      'Get 5 Full Reports'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    No subscription • No commitment
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