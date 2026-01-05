
-- =============================================
-- MAJOR SOCIAL NETWORK UPGRADE MIGRATION
-- =============================================

-- 1. FRIENDSHIPS TABLE - Two-way friend relationships
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view friendships they're part of"
ON public.friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of"
ON public.friendships FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own friend requests or unfriend"
ON public.friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 2. CONVERSATIONS TABLE - Chat conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 3. CONVERSATION PARTICIPANTS TABLE
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversation participants policies
CREATE POLICY "Users can view conversations they're in"
ON public.conversation_participants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can join conversations"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
ON public.conversation_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave conversations"
ON public.conversation_participants FOR DELETE
USING (auth.uid() = user_id);

-- Conversations policies (need to check participant)
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_id = id AND user_id = auth.uid()
));

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Participants can update conversation"
ON public.conversations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_id = id AND user_id = auth.uid()
));

-- 4. MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'camly_gift', 'emoji', 'system')),
  media_url TEXT,
  camly_amount INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Senders can update their messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Senders can delete their messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- 5. POST SHARES TABLE
CREATE TABLE public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_caption TEXT,
  visibility TEXT DEFAULT 'public',
  camly_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shares are viewable by everyone"
ON public.post_shares FOR SELECT
USING (true);

CREATE POLICY "Users can share posts"
ON public.post_shares FOR INSERT
WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete their shares"
ON public.post_shares FOR DELETE
USING (auth.uid() = shared_by);

-- 6. USER ONLINE STATUS TABLE
CREATE TABLE public.user_online_status (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  show_status BOOLEAN DEFAULT true
);

ALTER TABLE public.user_online_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Online status is viewable by everyone"
ON public.user_online_status FOR SELECT
USING (show_status = true OR auth.uid() = user_id);

CREATE POLICY "Users can update their own status"
ON public.user_online_status FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own status"
ON public.user_online_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 7. UPDATE PROFILES TABLE - Add new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS work TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS friends_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true;

-- 8. UPDATE POSTS TABLE - Add repost columns
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES public.posts(id),
ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_caption TEXT;

-- 9. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_original ON public.post_shares(original_post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user ON public.post_shares(shared_by);

-- 10. FUNCTION: Update friends_count when friendship accepted
CREATE OR REPLACE FUNCTION public.update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    -- Increment friends count for both users
    UPDATE public.profiles SET friends_count = COALESCE(friends_count, 0) + 1 WHERE id = NEW.requester_id;
    UPDATE public.profiles SET friends_count = COALESCE(friends_count, 0) + 1 WHERE id = NEW.addressee_id;
  ELSIF OLD.status = 'accepted' AND (NEW.status != 'accepted' OR TG_OP = 'DELETE') THEN
    -- Decrement friends count for both users
    UPDATE public.profiles SET friends_count = GREATEST(COALESCE(friends_count, 0) - 1, 0) WHERE id = OLD.requester_id;
    UPDATE public.profiles SET friends_count = GREATEST(COALESCE(friends_count, 0) - 1, 0) WHERE id = OLD.addressee_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_friends_count
AFTER INSERT OR UPDATE OR DELETE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.update_friends_count();

-- 11. FUNCTION: Update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at,
      last_message_preview = LEFT(NEW.content, 100),
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- 12. FUNCTION: Update shares_count on posts
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET shares_count = COALESCE(shares_count, 0) + 1 WHERE id = NEW.original_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0) WHERE id = OLD.original_post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_post_shares_count
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();

-- 13. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-photos', 'cover-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('message-media', 'message-media', false) ON CONFLICT DO NOTHING;

-- Cover photos storage policies
CREATE POLICY "Cover photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-photos');

CREATE POLICY "Users can upload their own cover photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cover-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own cover photo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cover-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover photo"
ON storage.objects FOR DELETE
USING (bucket_id = 'cover-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Message media storage policies
CREATE POLICY "Conversation participants can view message media"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-media');

CREATE POLICY "Users can upload message media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 14. Enable realtime for messages and online status
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_online_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
