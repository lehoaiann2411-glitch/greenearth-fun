-- Create calls table for voice/video calls
CREATE TABLE public.calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES public.profiles(id) NOT NULL,
  callee_id UUID REFERENCES public.profiles(id) NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'voice' CHECK (call_type IN ('voice', 'video')),
  status TEXT NOT NULL DEFAULT 'calling' CHECK (status IN ('calling', 'accepted', 'rejected', 'missed', 'ended')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Users can see calls they're involved in
CREATE POLICY "Users can view their own calls"
ON public.calls FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Users can create calls
CREATE POLICY "Users can create calls"
ON public.calls FOR INSERT
WITH CHECK (auth.uid() = caller_id);

-- Users can update calls they're involved in
CREATE POLICY "Users can update their calls"
ON public.calls FOR UPDATE
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;