-- =============================================
-- PHASE 1: Database Schema Enhancements
-- =============================================

-- 1.1 Create user_blocks table for blocking functionality
CREATE TABLE public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- 1.2 Add message status tracking columns
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ;

-- 1.3 Create typing indicators table
CREATE TABLE public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- 1.4 Add user communication settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS do_not_disturb BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_sounds BOOLEAN DEFAULT true;

-- 1.5 Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

-- =============================================
-- PHASE 2: Security - Friend-Based Access Control Functions
-- =============================================

-- 2.1 Create are_friends function to check friendship status
CREATE OR REPLACE FUNCTION public.are_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND ((requester_id = user1 AND addressee_id = user2)
      OR (requester_id = user2 AND addressee_id = user1))
  )
$$;

-- 2.2 Create is_blocked function to check block status
CREATE OR REPLACE FUNCTION public.is_blocked(user1 UUID, user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = user1 AND blocked_id = user2)
       OR (blocker_id = user2 AND blocked_id = user1)
  )
$$;

-- 2.3 Function to get the other participant in a conversation
CREATE OR REPLACE FUNCTION public.get_conversation_other_user(conv_id UUID, current_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.conversation_participants
  WHERE conversation_id = conv_id AND user_id != current_user_id
  LIMIT 1
$$;

-- =============================================
-- PHASE 3: RLS Policies for user_blocks
-- =============================================

-- Users can view their own blocks (both as blocker and blocked)
CREATE POLICY "Users can view their own blocks"
ON public.user_blocks
FOR SELECT
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

-- Users can only create blocks where they are the blocker
CREATE POLICY "Users can block others"
ON public.user_blocks
FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

-- Users can only delete blocks they created
CREATE POLICY "Users can unblock"
ON public.user_blocks
FOR DELETE
USING (auth.uid() = blocker_id);

-- =============================================
-- PHASE 4: RLS Policies for typing_indicators
-- =============================================

-- Users can view typing indicators for conversations they're part of
CREATE POLICY "Users can view typing in their conversations"
ON public.typing_indicators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = typing_indicators.conversation_id
    AND user_id = auth.uid()
  )
);

-- Users can update their own typing status
CREATE POLICY "Users can update their typing status"
ON public.typing_indicators
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = typing_indicators.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can modify their typing status"
ON public.typing_indicators
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their typing status"
ON public.typing_indicators
FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- PHASE 5: Enhanced RLS for messages (friend-only + no blocked)
-- =============================================

-- Drop existing message policies if they exist (we'll recreate)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Users can view messages in conversations they're part of (unless blocked)
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()
  )
  AND NOT public.is_blocked(
    auth.uid(),
    COALESCE(
      (SELECT user_id FROM public.conversation_participants 
       WHERE conversation_id = messages.conversation_id AND user_id != auth.uid() LIMIT 1),
      auth.uid()
    )
  )
);

-- Users can send messages only to friends (not blocked)
CREATE POLICY "Users can send messages to friends only"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()
  )
  AND (
    -- Check if conversation is with a friend
    SELECT public.are_friends(
      auth.uid(),
      COALESCE(
        (SELECT user_id FROM public.conversation_participants 
         WHERE conversation_id = messages.conversation_id AND user_id != auth.uid() LIMIT 1),
        auth.uid()
      )
    )
  )
  AND NOT public.is_blocked(
    auth.uid(),
    COALESCE(
      (SELECT user_id FROM public.conversation_participants 
       WHERE conversation_id = messages.conversation_id AND user_id != auth.uid() LIMIT 1),
      auth.uid()
    )
  )
);

-- Users can update messages in their conversations (for marking as read, delivered, seen)
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- =============================================
-- PHASE 6: Enhanced RLS for calls (friend-only + no blocked)
-- =============================================

-- Drop existing call policies if they exist
DROP POLICY IF EXISTS "Users can view their calls" ON public.calls;
DROP POLICY IF EXISTS "Users can create calls" ON public.calls;
DROP POLICY IF EXISTS "Users can update their calls" ON public.calls;

-- Users can view their own calls (as caller or callee)
CREATE POLICY "Users can view their calls"
ON public.calls
FOR SELECT
USING (
  (auth.uid() = caller_id OR auth.uid() = callee_id)
  AND NOT public.is_blocked(caller_id, callee_id)
);

-- Users can only call friends (not blocked)
CREATE POLICY "Users can call friends only"
ON public.calls
FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND public.are_friends(caller_id, callee_id)
  AND NOT public.is_blocked(caller_id, callee_id)
);

-- Users can update calls they're part of
CREATE POLICY "Users can update their calls"
ON public.calls
FOR UPDATE
USING (
  auth.uid() = caller_id OR auth.uid() = callee_id
);

-- =============================================
-- PHASE 7: Trigger for missed call notifications
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_missed_call_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'missed' AND (OLD.status IS NULL OR OLD.status != 'missed') THEN
    INSERT INTO public.notifications (
      user_id,
      actor_id,
      type,
      title,
      message,
      reference_id,
      reference_type
    ) VALUES (
      NEW.callee_id,
      NEW.caller_id,
      'missed_call',
      'Missed Call',
      CASE WHEN NEW.call_type = 'video' THEN 'Missed video call' ELSE 'Missed voice call' END,
      NEW.id,
      'call'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for missed call notifications
DROP TRIGGER IF EXISTS trigger_missed_call_notification ON public.calls;
CREATE TRIGGER trigger_missed_call_notification
  AFTER UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_missed_call_notification();

-- =============================================
-- PHASE 8: Trigger for new message notifications
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_profile RECORD;
BEGIN
  -- Get the recipient (other participant in conversation)
  SELECT user_id INTO recipient_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id
  AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NOT NULL THEN
    -- Get sender profile
    SELECT full_name INTO sender_profile
    FROM public.profiles
    WHERE id = NEW.sender_id;

    -- Check if recipient has DND disabled
    IF NOT (SELECT COALESCE(do_not_disturb, false) FROM public.profiles WHERE id = recipient_id) THEN
      INSERT INTO public.notifications (
        user_id,
        actor_id,
        type,
        title,
        message,
        reference_id,
        reference_type
      ) VALUES (
        recipient_id,
        NEW.sender_id,
        'new_message',
        'New Message',
        LEFT(COALESCE(NEW.content, 'Sent media'), 50),
        NEW.conversation_id,
        'conversation'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new message notifications
DROP TRIGGER IF EXISTS trigger_new_message_notification ON public.messages;
CREATE TRIGGER trigger_new_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();