-- 1) Create helper function to check conversation participant (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid, u_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND user_id = u_id
  )
$$;

-- 2) Fix conversation_participants policies (remove recursion)
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Participants added via RPC only" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;

CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Participants added via RPC only"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 3) Fix conversations policies (remove recursion)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Conversations created via RPC only" ON public.conversations;

CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Conversations created via RPC only"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));

-- 4) Fix messages policies (remove recursion by using helper functions)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to friends" ON public.messages;
DROP POLICY IF EXISTS "Users can update message status" ON public.messages;
DROP POLICY IF EXISTS "Senders can update their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
  AND NOT public.is_blocked(auth.uid(), public.get_conversation_other_user(conversation_id, auth.uid()))
);

CREATE POLICY "Users can send messages to friends"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
  AND public.are_friends(auth.uid(), public.get_conversation_other_user(conversation_id, auth.uid()))
  AND NOT public.is_blocked(auth.uid(), public.get_conversation_other_user(conversation_id, auth.uid()))
);

CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));