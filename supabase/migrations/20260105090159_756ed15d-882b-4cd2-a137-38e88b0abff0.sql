-- Create storage bucket for stories
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stories bucket
CREATE POLICY "Users can upload their own stories"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view stories"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'stories');

CREATE POLICY "Users can delete their own stories"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add new columns to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS text_overlays JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS stickers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS drawings JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS music_url TEXT,
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS reactions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;

-- Create story_reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS on story_reactions
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for story_reactions
CREATE POLICY "Story reactions are viewable by everyone"
ON story_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add their own reactions"
ON story_reactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
ON story_reactions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
ON story_reactions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create story_replies table
CREATE TABLE IF NOT EXISTS story_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_green_reply BOOLEAN DEFAULT false,
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on story_replies
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for story_replies
CREATE POLICY "Story owners can view replies to their stories"
ON story_replies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stories 
    WHERE stories.id = story_replies.story_id 
    AND stories.user_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can send replies"
ON story_replies FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
ON story_replies FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Function to update story reactions count
CREATE OR REPLACE FUNCTION update_story_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET reactions_count = reactions_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET reactions_count = GREATEST(reactions_count - 1, 0) WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for story reactions count
DROP TRIGGER IF EXISTS on_story_reaction_change ON story_reactions;
CREATE TRIGGER on_story_reaction_change
AFTER INSERT OR DELETE ON story_reactions
FOR EACH ROW EXECUTE FUNCTION update_story_reactions_count();

-- Function to update story replies count
CREATE OR REPLACE FUNCTION update_story_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET replies_count = replies_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for story replies count
DROP TRIGGER IF EXISTS on_story_reply_change ON story_replies;
CREATE TRIGGER on_story_reply_change
AFTER INSERT OR DELETE ON story_replies
FOR EACH ROW EXECUTE FUNCTION update_story_replies_count();