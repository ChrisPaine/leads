-- Add credits column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS search_credits INTEGER NOT NULL DEFAULT 0;

-- Create table to track credit purchases
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  credits_purchased INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on credit_purchases
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_purchases
CREATE POLICY "Users can view their own credit purchases"
ON public.credit_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);
