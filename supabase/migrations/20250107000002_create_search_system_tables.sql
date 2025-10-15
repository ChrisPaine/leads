-- Create search_results table to cache SerpAPI results
CREATE TABLE IF NOT EXISTS search_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_hash TEXT NOT NULL, -- MD5 hash of query + platforms + filters for caching
  query_text TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  time_filter TEXT,
  results JSONB NOT NULL, -- Array of search results from SerpAPI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_result_id UUID REFERENCES search_results(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('summary', 'mvp_builder')),
  selected_results JSONB NOT NULL, -- Array of selected result objects
  report_content JSONB NOT NULL, -- Structured report data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_credits table for tracking credits
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 0,
  total_credits_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table for tracking credit usage
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for usage, positive for purchase
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('search', 'report_generation', 'purchase', 'refund')),
  related_id UUID, -- ID of related report or search
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_results_query_hash ON search_results(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_results_expires_at ON search_results(expires_at);
CREATE INDEX IF NOT EXISTS idx_search_results_user_id ON search_results(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- Enable Row Level Security
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_results
CREATE POLICY "Users can view their own search results"
  ON search_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search results"
  ON search_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search results"
  ON search_results FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user_credits entry for new users
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_credits when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_credits();

-- Function to clean up expired search results (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_search_results()
RETURNS void AS $$
BEGIN
  DELETE FROM search_results WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement user credits
CREATE OR REPLACE FUNCTION decrement_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits_remaining INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF v_current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Decrement credits
  UPDATE user_credits
  SET credits_remaining = credits_remaining - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, related_id, description)
  VALUES (p_user_id, -p_amount, p_transaction_type, p_related_id, p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add user credits (for purchases/admin grants)
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Add credits
  UPDATE user_credits
  SET credits_remaining = credits_remaining + p_amount,
      total_credits_purchased = total_credits_purchased + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, related_id, description)
  VALUES (p_user_id, p_amount, p_transaction_type, NULL, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;