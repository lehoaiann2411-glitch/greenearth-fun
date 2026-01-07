-- Phase A: Create RPC function for creating direct conversations securely

-- A1) Create function to create direct conversation (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.create_direct_conversation(target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  existing_conversation_id uuid;
  new_conversation_id uuid;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Prevent self-messaging
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;
  
  -- Check if they are friends (mutual friends only)
  IF NOT public.are_friends(current_user_id, target_user_id) THEN
    RAISE EXCEPTION 'Can only message friends';
  END IF;
  
  -- Check if either user has blocked the other
  IF public.is_blocked(current_user_id, target_user_id) THEN
    RAISE EXCEPTION 'Cannot message this user';
  END IF;
  
  -- Check for existing direct conversation between these two users
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  WHERE c.type = 'direct'
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp1 
    WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
  )
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp2 
    WHERE cp2.conversation_id = c.id AND cp2.user_id = target_user_id
  )
  LIMIT 1;
  
  -- If conversation exists, return it
  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations (type, created_at, updated_at)
  VALUES ('direct', now(), now())
  RETURNING id INTO new_conversation_id;
  
  -- Add both participants (using SECURITY DEFINER bypasses RLS)
  INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
  VALUES 
    (new_conversation_id, current_user_id, now()),
    (new_conversation_id, target_user_id, now());
  
  RETURN new_conversation_id;
END;
$$;

-- A2) Update conversation_participants INSERT policy to prevent direct client inserts
-- Drop old permissive policy and create restrictive one
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;

CREATE POLICY "Participants added via RPC only"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (false); -- Block all direct inserts, must use RPC

-- A3) Clean up messages policies to enforce friends-only rule strictly
-- Drop old permissive policies
DROP POLICY IF EXISTS "Participants can view messages" ON messages;
DROP POLICY IF EXISTS "Participants can send messages" ON messages;

-- Keep only the strict friends-only policies (already exist):
-- "Friends can view messages in their conversations"
-- "Friends can send messages"