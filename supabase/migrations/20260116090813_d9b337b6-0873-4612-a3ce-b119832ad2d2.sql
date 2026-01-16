-- Create profile_photo_likes table
CREATE TABLE public.profile_photo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('avatar', 'cover')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_id, photo_type)
);

-- Create profile_photo_comments table
CREATE TABLE public.profile_photo_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('avatar', 'cover')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_profile_photo_likes_profile ON public.profile_photo_likes(profile_id, photo_type);
CREATE INDEX idx_profile_photo_comments_profile ON public.profile_photo_comments(profile_id, photo_type);

-- Enable RLS
ALTER TABLE public.profile_photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photo_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_photo_likes
CREATE POLICY "Anyone can view profile photo likes"
ON public.profile_photo_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like profile photos"
ON public.profile_photo_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.profile_photo_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for profile_photo_comments
CREATE POLICY "Anyone can view profile photo comments"
ON public.profile_photo_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can comment on profile photos"
ON public.profile_photo_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.profile_photo_comments FOR DELETE
USING (auth.uid() = user_id);