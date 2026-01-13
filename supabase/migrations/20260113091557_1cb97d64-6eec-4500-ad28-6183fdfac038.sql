-- Fix the permissive INSERT policy for group_call_participants
DROP POLICY "Insert participants" ON public.group_call_participants;

CREATE POLICY "Insert participants" ON public.group_call_participants
  FOR INSERT WITH CHECK (
    -- User can add themselves OR initiator can add participants
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.group_calls 
      WHERE id = group_call_id AND initiator_id = auth.uid()
    )
  );

-- =============================================
-- CALL RECORDINGS TABLE
-- =============================================
CREATE TABLE public.call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  group_call_id UUID REFERENCES public.group_calls(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT call_recordings_call_check CHECK (call_id IS NOT NULL OR group_call_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;

-- Only recording owner or call participants can view
CREATE POLICY "View own recordings" ON public.call_recordings
  FOR SELECT USING (
    recorded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.calls WHERE calls.id = call_recordings.call_id
      AND (calls.caller_id = auth.uid() OR calls.callee_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.group_call_participants 
      WHERE group_call_id = call_recordings.group_call_id AND user_id = auth.uid()
    )
  );

-- Only participants can create recording
CREATE POLICY "Create recording" ON public.call_recordings
  FOR INSERT WITH CHECK (recorded_by = auth.uid());

-- Only owner can delete their recording
CREATE POLICY "Delete own recording" ON public.call_recordings
  FOR DELETE USING (recorded_by = auth.uid());