-- Add media_type column to reels table
ALTER TABLE reels 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'video' CHECK (media_type IN ('video', 'image'));

-- Add image_url column for image reels
ALTER TABLE reels
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create bucket for reel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('reel-images', 'reel-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for reel-images bucket
CREATE POLICY "Users can upload their own reel images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own reel images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'reel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reel images"
ON storage.objects FOR DELETE
USING (bucket_id = 'reel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view reel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reel-images');