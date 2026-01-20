-- Sound Library for Reels
CREATE TABLE public.sound_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  artist TEXT,
  category TEXT DEFAULT 'trending',
  duration_seconds INTEGER,
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  use_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sound_library ENABLE ROW LEVEL SECURITY;

-- Everyone can view sounds
CREATE POLICY "Anyone can view sounds" ON public.sound_library
  FOR SELECT USING (true);

-- Live Streams table
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'preparing',
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_gifts INTEGER DEFAULT 0,
  camly_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live streams" ON public.live_streams
  FOR SELECT USING (true);

CREATE POLICY "Users can create own streams" ON public.live_streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streams" ON public.live_streams
  FOR UPDATE USING (auth.uid() = user_id);

-- Live Stream Viewers
CREATE TABLE public.live_stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(stream_id, user_id)
);

ALTER TABLE public.live_stream_viewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stream viewers" ON public.live_stream_viewers
  FOR SELECT USING (true);

CREATE POLICY "Users can join streams" ON public.live_stream_viewers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave streams" ON public.live_stream_viewers
  FOR UPDATE USING (auth.uid() = user_id);

-- Live Stream Comments/Chat
CREATE TABLE public.live_stream_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_gift BOOLEAN DEFAULT false,
  gift_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_stream_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stream comments" ON public.live_stream_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.live_stream_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add some sample sounds
INSERT INTO public.sound_library (name, artist, category, duration_seconds, audio_url, is_featured) VALUES
  ('Nature Vibes', 'EcoSounds', 'nature', 30, 'https://cdn.pixabay.com/audio/2022/03/15/audio_8c9a94d55e.mp3', true),
  ('Chill Lo-fi', 'ChillHop', 'lofi', 45, 'https://cdn.pixabay.com/audio/2022/05/27/audio_4e93c1edb8.mp3', true),
  ('Happy Day', 'SunnyTunes', 'pop', 30, 'https://cdn.pixabay.com/audio/2022/10/25/audio_574b79ebff.mp3', true),
  ('Ocean Waves', 'NatureSounds', 'nature', 60, 'https://cdn.pixabay.com/audio/2022/02/22/audio_24109e3c20.mp3', false),
  ('Acoustic Morning', 'GuitarVibes', 'acoustic', 35, 'https://cdn.pixabay.com/audio/2022/08/02/audio_884be4f8e3.mp3', true);

-- Create index for faster queries
CREATE INDEX idx_live_streams_status ON public.live_streams(status);
CREATE INDEX idx_live_streams_user ON public.live_streams(user_id);
CREATE INDEX idx_sound_library_category ON public.sound_library(category);