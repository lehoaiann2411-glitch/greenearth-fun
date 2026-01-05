-- Create enums for campaign management
CREATE TYPE campaign_category AS ENUM ('tree_planting', 'cleanup', 'recycling', 'awareness', 'other');
CREATE TYPE campaign_status AS ENUM ('draft', 'pending', 'active', 'completed', 'cancelled');
CREATE TYPE participant_status AS ENUM ('registered', 'checked_in', 'completed', 'cancelled');

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category campaign_category NOT NULL DEFAULT 'other',
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  target_participants INTEGER NOT NULL DEFAULT 10,
  target_trees INTEGER DEFAULT 0,
  image_url TEXT,
  status campaign_status NOT NULL DEFAULT 'pending',
  green_points_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create campaign_participants table
CREATE TABLE public.campaign_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status participant_status NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMPTZ,
  trees_planted INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

-- Campaigns RLS policies
CREATE POLICY "Campaigns are viewable by everyone"
  ON public.campaigns FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = creator_id);

-- Campaign participants RLS policies
CREATE POLICY "Participants are viewable by everyone"
  ON public.campaign_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join campaigns"
  ON public.campaign_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON public.campaign_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave campaigns"
  ON public.campaign_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for campaign images
INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-images', 'campaign-images', true);

-- Storage policies for campaign images
CREATE POLICY "Campaign images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-images');

CREATE POLICY "Authenticated users can upload campaign images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'campaign-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their campaign images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'campaign-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their campaign images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'campaign-images' AND auth.role() = 'authenticated');

-- Function to handle participant completion (update user stats)
CREATE OR REPLACE FUNCTION public.handle_participant_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  campaign_reward INTEGER;
  trees_count INTEGER;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get campaign reward and trees
    SELECT green_points_reward INTO campaign_reward FROM campaigns WHERE id = NEW.campaign_id;
    trees_count := COALESCE(NEW.trees_planted, 0);
    
    -- Update user profile
    UPDATE profiles
    SET 
      campaigns_joined = campaigns_joined + 1,
      green_points = green_points + COALESCE(campaign_reward, 10),
      trees_planted = trees_planted + trees_count
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for participant completion
CREATE TRIGGER on_participant_completion
  AFTER UPDATE ON public.campaign_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_participant_completion();