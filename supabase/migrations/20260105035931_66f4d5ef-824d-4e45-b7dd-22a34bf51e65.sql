-- Add new columns to profiles for Camly Coin system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS camly_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes_given INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in DATE;

-- Create daily_limits table for anti-spam
CREATE TABLE IF NOT EXISTS public.daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  limit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shares_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, limit_date)
);

-- Enable RLS
ALTER TABLE public.daily_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_limits
CREATE POLICY "Users can view their own daily limits"
ON public.daily_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily limits"
ON public.daily_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily limits"
ON public.daily_limits FOR UPDATE
USING (auth.uid() = user_id);

-- Add camly_earned column to points_history (keeping points_earned for backwards compatibility)
ALTER TABLE public.points_history 
ADD COLUMN IF NOT EXISTS camly_earned INTEGER DEFAULT 0;