-- ============================================
-- PHASE 1: Message Reactions Table
-- ============================================
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions in conversations they participate in
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id
    AND cp.user_id = auth.uid()
  )
);

-- Users can add reactions to messages in their conversations
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id
    AND cp.user_id = auth.uid()
  )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- PHASE 2: Reply/Quote Messages
-- ============================================
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- ============================================
-- PHASE 3: File Sharing Metadata
-- ============================================
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;

-- ============================================
-- PHASE 4: Group Chat Enhancements
-- ============================================
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS nickname TEXT;

-- ============================================
-- Function to create group conversation
-- ============================================
CREATE OR REPLACE FUNCTION public.create_group_conversation(
  p_name TEXT,
  p_member_ids UUID[],
  p_avatar_url TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  new_conversation_id UUID;
  member_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF array_length(p_member_ids, 1) < 1 THEN
    RAISE EXCEPTION 'Group must have at least 1 other member';
  END IF;
  
  -- Create new group conversation
  INSERT INTO conversations (type, name, avatar_url, description, created_by, created_at, updated_at)
  VALUES ('group', p_name, p_avatar_url, p_description, current_user_id, now(), now())
  RETURNING id INTO new_conversation_id;
  
  -- Add creator as admin
  INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
  VALUES (new_conversation_id, current_user_id, 'admin', now());
  
  -- Add other members
  FOREACH member_id IN ARRAY p_member_ids
  LOOP
    IF member_id != current_user_id THEN
      INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
      VALUES (new_conversation_id, member_id, 'member', now())
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN new_conversation_id;
END;
$$;

-- ============================================
-- Function to add member to group
-- ============================================
CREATE OR REPLACE FUNCTION public.add_group_member(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  conv_type TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if current user is admin of this group
  SELECT role INTO user_role
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = current_user_id;
  
  SELECT type INTO conv_type FROM conversations WHERE id = p_conversation_id;
  
  IF conv_type != 'group' THEN
    RAISE EXCEPTION 'Not a group conversation';
  END IF;
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can add members';
  END IF;
  
  -- Add member
  INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
  VALUES (p_conversation_id, p_user_id, 'member', now())
  ON CONFLICT DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- ============================================
-- Function to remove member from group
-- ============================================
CREATE OR REPLACE FUNCTION public.remove_group_member(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  target_role TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if current user is admin
  SELECT role INTO user_role
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = current_user_id;
  
  -- Get target user role
  SELECT role INTO target_role
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
  
  -- Users can remove themselves, or admins can remove members
  IF current_user_id = p_user_id OR (user_role = 'admin' AND target_role != 'admin') THEN
    DELETE FROM conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  RAISE EXCEPTION 'Not authorized to remove this member';
END;
$$;