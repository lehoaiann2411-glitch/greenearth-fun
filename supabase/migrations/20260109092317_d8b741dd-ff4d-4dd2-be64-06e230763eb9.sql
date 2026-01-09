-- Create daily_habits table - Master list of eco habits
CREATE TABLE public.daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description TEXT,
  description_vi TEXT,
  icon_emoji TEXT DEFAULT '🌱',
  camly_reward INTEGER DEFAULT 30,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_habit_completions table - Track user progress
CREATE TABLE public.user_habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.daily_habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, habit_id, completed_date)
);

-- Add habit tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS habit_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_habit_date DATE;

-- Enable RLS
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_habits (read-only for authenticated users)
CREATE POLICY "Anyone can view active habits"
ON public.daily_habits
FOR SELECT
USING (is_active = true);

-- RLS Policies for user_habit_completions
CREATE POLICY "Users can view their own completions"
ON public.user_habit_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON public.user_habit_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON public.user_habit_completions
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_habit_completions_user_date 
ON public.user_habit_completions(user_id, completed_date);

CREATE INDEX idx_user_habit_completions_habit 
ON public.user_habit_completions(habit_id);

CREATE INDEX idx_daily_habits_active 
ON public.daily_habits(is_active) WHERE is_active = true;

-- Seed 10 sample eco habits
INSERT INTO public.daily_habits (title, title_vi, icon_emoji, camly_reward, order_index) VALUES
('Use reusable shopping bags', 'Mang túi vải đi chợ/mua sắm', '🛍️', 30, 1),
('Turn off lights when leaving', 'Tắt đèn và quạt khi ra khỏi phòng', '💡', 30, 2),
('Use personal water bottle', 'Uống nước từ bình cá nhân thay chai nhựa', '🥤', 30, 3),
('Sort waste at home', 'Phân loại rác tại nhà (hữu cơ / tái chế)', '♻️', 30, 4),
('Walk or cycle for short trips', 'Đi bộ hoặc xe đạp cho quãng đường ngắn', '🚴', 30, 5),
('Avoid plastic straws', 'Không dùng ống hút nhựa', '🥢', 30, 6),
('Eat at least one vegetarian meal', 'Ăn ít nhất 1 bữa chay', '🥗', 30, 7),
('Reuse bottles and containers', 'Tái sử dụng chai/lọ cũ', '🏺', 30, 8),
('Unplug unused electronics', 'Tắt thiết bị điện không dùng đến', '🔌', 30, 9),
('Buy local or second-hand', 'Mua sản phẩm địa phương hoặc second-hand', '🛒', 30, 10);