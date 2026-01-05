-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_vi TEXT,
  description TEXT,
  description_vi TEXT,
  cover_image_url TEXT,
  icon_emoji TEXT DEFAULT '🌳',
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  location TEXT,
  location_vi TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('tree_planting', 'cleanup', 'recycling', 'esg', 'education', 'general', 'other')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  members_count INTEGER DEFAULT 1,
  posts_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_featured BOOLEAN DEFAULT false
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  invited_by UUID REFERENCES public.profiles(id),
  camly_earned INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_posts table
CREATE TABLE public.group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  feeling TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_announcement BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_post_likes table
CREATE TABLE public.group_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create group_post_comments table
CREATE TABLE public.group_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.group_post_comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_events table
CREATE TABLE public.group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_vi TEXT,
  description TEXT,
  description_vi TEXT,
  cover_image_url TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  max_attendees INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  campaign_id UUID REFERENCES public.campaigns(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_event_rsvps table
CREATE TABLE public.group_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.group_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create group_invites table
CREATE TABLE public.group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  camly_earned INTEGER DEFAULT 0,
  invite_accepted BOOLEAN DEFAULT false,
  invitee_posted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, inviter_id, invitee_id)
);

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- Groups RLS policies
CREATE POLICY "Public groups are viewable by everyone" ON public.groups
  FOR SELECT USING (privacy = 'public' OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid() AND status = 'approved'
  ));

CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their groups" ON public.groups
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = created_by);

-- Group members RLS policies
CREATE POLICY "Group members are viewable by group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND privacy = 'public')
    OR EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved')
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update members" ON public.group_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role IN ('admin', 'moderator'))
  );

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
  ));

-- Group posts RLS policies
CREATE POLICY "Group posts are viewable by members" ON public.group_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND privacy = 'public')
    OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "Members can create posts" ON public.group_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "Authors can update their posts" ON public.group_posts
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

CREATE POLICY "Authors can delete their posts" ON public.group_posts
  FOR DELETE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Group post likes RLS policies
CREATE POLICY "Likes are viewable by everyone" ON public.group_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Members can like posts" ON public.group_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes" ON public.group_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Group post comments RLS policies
CREATE POLICY "Comments are viewable by everyone" ON public.group_post_comments
  FOR SELECT USING (true);

CREATE POLICY "Members can comment" ON public.group_post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete comments" ON public.group_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Group events RLS policies
CREATE POLICY "Events are viewable by group members" ON public.group_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND privacy = 'public')
    OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_events.group_id AND user_id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "Members can create events" ON public.group_events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update events" ON public.group_events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete events" ON public.group_events
  FOR DELETE USING (auth.uid() = created_by);

-- Group event RSVPs RLS policies
CREATE POLICY "RSVPs are viewable by everyone" ON public.group_event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Users can RSVP" ON public.group_event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVP" ON public.group_event_rsvps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel RSVP" ON public.group_event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

-- Group invites RLS policies
CREATE POLICY "Users can view their invites" ON public.group_invites
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can send invites" ON public.group_invites
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitees can update invite status" ON public.group_invites
  FOR UPDATE USING (auth.uid() = invitee_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.update_group_members_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE groups SET members_count = members_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE groups SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.group_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    UPDATE groups SET members_count = members_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE groups SET members_count = GREATEST(members_count - 1, 0) WHERE id = NEW.group_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_group_members_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.update_group_members_count();

CREATE OR REPLACE FUNCTION public.update_group_posts_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET posts_count = posts_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_group_posts_count_trigger
AFTER INSERT OR DELETE ON public.group_posts
FOR EACH ROW EXECUTE FUNCTION public.update_group_posts_count();

CREATE OR REPLACE FUNCTION public.update_group_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_group_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.group_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_group_post_likes_count();

CREATE OR REPLACE FUNCTION public.update_group_post_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_group_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.group_post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_group_post_comments_count();

CREATE OR REPLACE FUNCTION public.update_group_event_rsvp_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('going', 'interested') THEN
    UPDATE group_events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('going', 'interested') THEN
    UPDATE group_events SET rsvp_count = GREATEST(rsvp_count - 1, 0) WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('going', 'interested') AND NEW.status IN ('going', 'interested') THEN
      UPDATE group_events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
    ELSIF OLD.status IN ('going', 'interested') AND NEW.status NOT IN ('going', 'interested') THEN
      UPDATE group_events SET rsvp_count = GREATEST(rsvp_count - 1, 0) WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_group_event_rsvp_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.group_event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.update_group_event_rsvp_count();

CREATE OR REPLACE FUNCTION public.update_group_events_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET events_count = events_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET events_count = GREATEST(events_count - 1, 0) WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_group_events_count_trigger
AFTER INSERT OR DELETE ON public.group_events
FOR EACH ROW EXECUTE FUNCTION public.update_group_events_count();

-- Create storage bucket for group images
INSERT INTO storage.buckets (id, name, public) VALUES ('group-images', 'group-images', true);

-- Storage policies for group images
CREATE POLICY "Group images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'group-images');

CREATE POLICY "Authenticated users can upload group images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'group-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their group images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'group-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their group images" ON storage.objects
  FOR DELETE USING (bucket_id = 'group-images' AND auth.role() = 'authenticated');

-- Insert seed data for featured groups (created by a system user, will update created_by on first admin join)
-- We'll use a placeholder that will be updated when real users create/claim these groups