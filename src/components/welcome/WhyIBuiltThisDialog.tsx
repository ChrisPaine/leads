import React, { useState } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from "@/utils/utils";

interface WhyIBuiltThisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Custom DialogContent without the X close button
const DialogContentNoClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      onPointerDownOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContentNoClose.displayName = "DialogContentNoClose";

export const WhyIBuiltThisDialog: React.FC<WhyIBuiltThisDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isButtonDisabled = !email.trim() || !isValidEmail(email) || isSubmitting;

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert email into Supabase
      const { data, error } = await supabase
        .from('email_signups')
        .insert([
          {
            email: email.trim().toLowerCase(),
          }
        ])
        .select();

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          // Duplicate email - still consider it a success
          toast({
            title: 'Welcome back!',
            description: 'This email is already registered. Enjoy your free searches!',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Success!',
          description: 'You\'re all set! Enjoy your 3 free searches.',
        });
      }

      // Set localStorage flags so modal doesn't show again
      localStorage.setItem('email_submitted', 'true');
      localStorage.setItem('submitted_email', email.trim().toLowerCase());

      // IMPORTANT: Clear the anonymous usage counter so email tracking takes over
      localStorage.removeItem('usage_anonymous');

      // Dispatch custom event to notify the app that email was submitted
      window.dispatchEvent(new CustomEvent('emailSubmitted', {
        detail: { email: email.trim().toLowerCase() }
      }));

      // Close the modal
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving email:', error);
      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContentNoClose className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Why We Built This
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Revolutionary Discovery */}
          <div>
            <p className="text-foreground leading-relaxed text-base">
              In a world of expensive, staged market research, we discovered something revolutionary:
              <span className="font-semibold"> the most honest customer insights are scattered across the entire social internet - not just one platform.</span>
            </p>
          </div>

          {/* First and Only */}
          <div>
            <p className="text-foreground leading-relaxed text-base">
              We're the first and only platform that transforms raw, unfiltered conversations from YouTube, Reddit, Twitter, LinkedIn, and beyond into actionable market intelligence.
            </p>
          </div>

          {/* Other Companies */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <p className="text-foreground leading-relaxed text-base">
              Other companies spend millions on focus groups and surveys. We listen where customers are already talking - candidly, freely, without filters - across every platform where they naturally express themselves.
            </p>
          </div>

          {/* Technology */}
          <div>
            <p className="text-foreground leading-relaxed text-base">
              Our technology doesn't just collect data from one source; it captures the real, unvarnished voice of the market wherever it speaks.
            </p>
          </div>

          {/* Because */}
          <div className="bg-primary/5 border-l-4 border-primary pl-4 py-3">
            <p className="text-foreground font-semibold leading-relaxed text-lg">
              Because your customers aren't just on YouTube. They're everywhere.
            </p>
          </div>

          {/* User Count */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Join 334+ users finding real customer insights
            </p>
          </div>

          {/* Email Input */}
          <div className="pt-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isButtonDisabled && handleSubmit()}
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            />
          </div>

          {/* Call to Action */}
          <div>
            <Button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className="w-full h-12 text-base font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Get 3 Free Searches'}
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-3">
              No credit card required
            </p>
          </div>
        </div>
      </DialogContentNoClose>
    </Dialog>
  );
};
