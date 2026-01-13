-- =============================================
-- GROUP CALL PARTICIPANTS TABLE (create first)
-- =============================================
CREATE TABLE public.group_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_call_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,
  is_video_off BOOLEAN DEFAULT false
);

-- =============================================
-- GROUP CALLS TABLE
-- =============================================
CREATE TABLE public.group_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  call_type TEXT DEFAULT 'video' CHECK (call_type IN ('voice', 'video')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  title TEXT,
  max_participants INTEGER DEFAULT 10,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint after both tables exist
ALTER TABLE public.group_call_participants 
ADD CONSTRAINT group_call_participants_group_call_id_fkey 
FOREIGN KEY (group_call_id) REFERENCES public.group_calls(id) ON DELETE CASCADE;

-- Add unique constraint
ALTER TABLE public.group_call_participants 
ADD CONSTRAINT group_call_participants_unique UNIQUE(group_call_id, user_id);

-- Enable RLS on group_calls
ALTER TABLE public.group_calls ENABLE ROW LEVEL SECURITY;

-- Enable RLS on group_call_participants
ALTER TABLE public.group_call_participants ENABLE ROW LEVEL SECURITY;

-- Policies for group_call_participants (create first as group_calls policy references it)
CREATE POLICY "View participants" ON public.group_call_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.group_call_participants gcp 
      WHERE gcp.group_call_id = group_call_participants.group_call_id 
      AND gcp.user_id = auth.uid()
    )
  );

CREATE POLICY "Insert participants" ON public.group_call_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Update own participant" ON public.group_call_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Policies for group_calls
CREATE POLICY "View group calls" ON public.group_calls
  FOR SELECT USING (
    initiator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_call_participants 
      WHERE group_call_id = group_calls.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Create group calls" ON public.group_calls
  FOR INSERT WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Update own group calls" ON public.group_calls
  FOR UPDATE USING (initiator_id = auth.uid());