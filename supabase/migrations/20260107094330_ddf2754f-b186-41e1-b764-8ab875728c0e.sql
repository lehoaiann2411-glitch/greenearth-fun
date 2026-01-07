-- 1) Add payload column to messages table for storing call log data
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT NULL;

-- 2) Create function to insert call log message into conversation
CREATE OR REPLACE FUNCTION public.insert_call_log_message(
  p_caller_id uuid,
  p_callee_id uuid,
  p_call_type text,
  p_call_status text,
  p_duration_seconds integer,
  p_call_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Find direct conversation between caller and callee
  SELECT cp1.conversation_id INTO v_conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  JOIN conversations c ON c.id = cp1.conversation_id
  WHERE cp1.user_id = p_caller_id
    AND cp2.user_id = p_callee_id
    AND c.type = 'direct'
  LIMIT 1;

  -- If conversation exists, insert call log message
  IF v_conversation_id IS NOT NULL THEN
    INSERT INTO messages (
      conversation_id,
      sender_id,
      content,
      message_type,
      payload
    ) VALUES (
      v_conversation_id,
      p_caller_id,
      NULL,
      'call_log',
      jsonb_build_object(
        'call_id', p_call_id,
        'call_type', p_call_type,
        'call_status', p_call_status,
        'duration_seconds', p_duration_seconds,
        'caller_id', p_caller_id,
        'callee_id', p_callee_id
      )
    );
  END IF;
END;
$$;