-- Add total_camly_claimed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_camly_claimed INTEGER DEFAULT 0;

-- Create claims_history table
CREATE TABLE public.claims_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  green_points_converted INTEGER NOT NULL,
  camly_received INTEGER NOT NULL,
  transaction_hash TEXT,
  wallet_address TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create points_history table for tracking all point earnings
CREATE TABLE public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  camly_equivalent INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.claims_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for claims_history
CREATE POLICY "Users can view own claims" ON public.claims_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims" ON public.claims_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for points_history
CREATE POLICY "Users can view own points history" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points history" ON public.points_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update daily_quests points_reward
UPDATE public.daily_quests SET points_reward = 5 WHERE quest_type = 'daily_check_in';
UPDATE public.daily_quests SET points_reward = 10 WHERE quest_type IN ('share_post', 'like_posts', 'read_eco_fact');