import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UpgradeAfterSearchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeAfterSearchesDialog: React.FC<UpgradeAfterSearchesDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();

  // These should match your actual Stripe Price IDs
  // For now using Professional tier price ID - update these with your actual IDs
  const PRICE_IDS = {
    starter: 'price_1S83kOGVHdPbhL3jjHqKOaOL',     // Update with your Starter price ID
    professional: 'price_1S83kOGVHdPbhL3jjHqKOaOL', // Your Pro price ID
    agency: 'price_1S83kOGVHdPbhL3jjHqKOaOL',       // Update with your Agency price ID
  };

  const handleUpgrade = async (tier: 'starter' | 'professional' | 'agency') => {
    setIsLoading(true);
    setLoadingTier(tier);

    try {
      // Get the user's email from localStorage
      const userEmail = localStorage.getItem('submitted_email');

      if (!userEmail) {
        toast({
          title: 'Error',
          description: 'Email not found. Please refresh and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        setLoadingTier(null);
        return;
      }

      const priceId = PRICE_IDS[tier];

      // Call Supabase edge function to create checkout (without auth required)
      const { data, error } = await supabase.functions.invoke('create-checkout-email', {
        body: {
          priceId,
          customerEmail: userEmail,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setLoadingTier(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            You've used your 3 free searches!
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Upgrade to continue finding customer insights
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Starter Plan */}
          <div className="border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Unlimited searches</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">All platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Save queries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Email support</span>
              </li>
            </ul>

            <Button
              onClick={() => handleUpgrade('starter')}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading && loadingTier === 'starter' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </Button>
          </div>

          {/* Professional Plan */}
          <div className="border-2 border-primary rounded-lg p-6 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$19.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Everything in Starter</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Advanced filters</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">API access</span>
              </li>
            </ul>

            <Button
              onClick={() => handleUpgrade('professional')}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && loadingTier === 'professional' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </Button>
          </div>

          {/* Agency Plan */}
          <div className="border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Agency</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Team collaboration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">White label reports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Dedicated support</span>
              </li>
            </ul>

            <Button
              onClick={() => handleUpgrade('agency')}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading && loadingTier === 'agency' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          All plans come with a 7-day money-back guarantee
        </p>
      </DialogContent>
    </Dialog>
  );
};