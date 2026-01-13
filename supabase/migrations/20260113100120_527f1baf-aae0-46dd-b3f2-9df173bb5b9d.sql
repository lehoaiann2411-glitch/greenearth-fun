-- Create secure function to transfer Camly coins between users
-- Uses SECURITY DEFINER to bypass RLS and allow updating receiver's balance
CREATE OR REPLACE FUNCTION public.transfer_camly_coins(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_balance INTEGER;
  receiver_balance INTEGER;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Validate sender is current user
  IF auth.uid() != p_sender_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only transfer from own account';
  END IF;
  
  -- Get sender balance with row lock
  SELECT camly_balance INTO sender_balance FROM profiles WHERE id = p_sender_id FOR UPDATE;
  
  IF sender_balance IS NULL OR sender_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE';
  END IF;
  
  -- Get receiver balance with row lock
  SELECT camly_balance INTO receiver_balance FROM profiles WHERE id = p_receiver_id FOR UPDATE;
  
  IF receiver_balance IS NULL THEN
    receiver_balance := 0;
  END IF;
  
  -- Deduct from sender
  UPDATE profiles SET camly_balance = sender_balance - p_amount WHERE id = p_sender_id;
  
  -- Add to receiver (SECURITY DEFINER bypasses RLS)
  UPDATE profiles SET camly_balance = receiver_balance + p_amount WHERE id = p_receiver_id;
  
  RETURN TRUE;
END;
$$;