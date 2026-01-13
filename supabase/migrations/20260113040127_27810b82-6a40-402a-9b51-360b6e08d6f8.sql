-- Table for saved posts
CREATE TABLE public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Table for saved stories
CREATE TABLE public.saved_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Table for saved reels
CREATE TABLE public.saved_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reel_id)
);

-- Enable RLS
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_posts
CREATE POLICY "Users can view own saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved posts" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved posts" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_stories
CREATE POLICY "Users can view own saved stories" ON public.saved_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved stories" ON public.saved_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved stories" ON public.saved_stories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_reels
CREATE POLICY "Users can view own saved reels" ON public.saved_reels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved reels" ON public.saved_reels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved reels" ON public.saved_reels FOR DELETE USING (auth.uid() = user_id);