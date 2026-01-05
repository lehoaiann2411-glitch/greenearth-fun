-- Create reels table (main video content)
CREATE TABLE public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  location_name TEXT,
  tagged_friends UUID[],
  music_name TEXT,
  music_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 15,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  camly_earned INTEGER DEFAULT 0,
  last_paid_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reel_likes table
CREATE TABLE public.reel_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reel_id, user_id)
);

-- Create reel_comments table
CREATE TABLE public.reel_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.reel_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reel_views table (for tracking unique views and creator rewards)
CREATE TABLE public.reel_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reel_id, viewer_id)
);

-- Create reel_gifts table (for Camly Coin gifts to creators)
CREATE TABLE public.reel_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reel_shares table
CREATE TABLE public.reel_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add reel columns to daily_limits table
ALTER TABLE public.daily_limits 
ADD COLUMN IF NOT EXISTS reel_likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reel_comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reel_shares_count INTEGER DEFAULT 0;

-- Enable RLS on all tables
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reels
CREATE POLICY "Anyone can view reels" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Users can create their own reels" ON public.reels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reels" ON public.reels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reels" ON public.reels FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reel_likes
CREATE POLICY "Anyone can view reel likes" ON public.reel_likes FOR SELECT USING (true);
CREATE POLICY "Users can like reels" ON public.reel_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike reels" ON public.reel_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reel_comments
CREATE POLICY "Anyone can view reel comments" ON public.reel_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on reels" ON public.reel_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comments" ON public.reel_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their comments" ON public.reel_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reel_views
CREATE POLICY "Anyone can view reel views" ON public.reel_views FOR SELECT USING (true);
CREATE POLICY "Users can record views" ON public.reel_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "Users can update their views" ON public.reel_views FOR UPDATE USING (auth.uid() = viewer_id);

-- RLS Policies for reel_gifts
CREATE POLICY "Anyone can view reel gifts" ON public.reel_gifts FOR SELECT USING (true);
CREATE POLICY "Users can send gifts" ON public.reel_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for reel_shares
CREATE POLICY "Anyone can view reel shares" ON public.reel_shares FOR SELECT USING (true);
CREATE POLICY "Users can share reels" ON public.reel_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updating counts
CREATE OR REPLACE FUNCTION public.update_reel_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reels SET likes_count = likes_count + 1 WHERE id = NEW.reel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reels SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.reel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_reel_like_change
AFTER INSERT OR DELETE ON public.reel_likes
FOR EACH ROW EXECUTE FUNCTION public.update_reel_likes_count();

CREATE OR REPLACE FUNCTION public.update_reel_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reels SET comments_count = comments_count + 1 WHERE id = NEW.reel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reels SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.reel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_reel_comment_change
AFTER INSERT OR DELETE ON public.reel_comments
FOR EACH ROW EXECUTE FUNCTION public.update_reel_comments_count();

CREATE OR REPLACE FUNCTION public.update_reel_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE reels SET views_count = views_count + 1 WHERE id = NEW.reel_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reel_view_insert
AFTER INSERT ON public.reel_views
FOR EACH ROW EXECUTE FUNCTION public.update_reel_views_count();

CREATE OR REPLACE FUNCTION public.update_reel_shares_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reels SET shares_count = shares_count + 1 WHERE id = NEW.reel_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_reel_share_insert
AFTER INSERT ON public.reel_shares
FOR EACH ROW EXECUTE FUNCTION public.update_reel_shares_count();

-- Create indexes for performance
CREATE INDEX idx_reels_user_id ON public.reels(user_id);
CREATE INDEX idx_reels_created_at ON public.reels(created_at DESC);
CREATE INDEX idx_reels_is_featured ON public.reels(is_featured) WHERE is_featured = true;
CREATE INDEX idx_reels_is_trending ON public.reels(is_trending) WHERE is_trending = true;
CREATE INDEX idx_reel_likes_reel_id ON public.reel_likes(reel_id);
CREATE INDEX idx_reel_comments_reel_id ON public.reel_comments(reel_id);
CREATE INDEX idx_reel_views_reel_id ON public.reel_views(reel_id);

-- Create storage bucket for reels videos
INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true);

-- Storage policies for reels bucket
CREATE POLICY "Reels are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'reels');
CREATE POLICY "Users can upload reels" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their reels" ON storage.objects FOR UPDATE USING (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their reels" ON storage.objects FOR DELETE USING (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);