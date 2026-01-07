-- Fix RLS policies for messaging system

-- ================================================
-- PART 1: Fix conversations RLS policies (currently broken)
-- ================================================

-- Drop broken policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversation" ON public.conversations;

-- Create correct SELECT policy
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
  )
);

-- Create correct UPDATE policy
CREATE POLICY "Participants can update conversation"
ON public.conversations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
  )
);

-- ================================================
-- PART 2: Fix conversation_participants SELECT policy
-- ================================================

-- Drop old policy that only allows viewing own rows
DROP POLICY IF EXISTS "Users can view conversations they're in" ON public.conversation_participants;

-- Create new policy that allows viewing all participants in conversations user is part of
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants my_participation
    WHERE my_participation.conversation_id = conversation_participants.conversation_id
      AND my_participation.user_id = auth.uid()
  )
);

-- ================================================
-- PART 3: Add DELETE policy for message-media storage bucket
-- ================================================

CREATE POLICY "Users can delete their message media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add SELECT policy for message-media (private bucket needs explicit policy)
CREATE POLICY "Users can view message media in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-media'
);

-- Add INSERT policy for message-media
CREATE POLICY "Authenticated users can upload message media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);