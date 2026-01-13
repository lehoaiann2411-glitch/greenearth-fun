-- Create camly_transactions table for transaction history
CREATE TABLE public.camly_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  transaction_type TEXT NOT NULL DEFAULT 'gift',
  message_id UUID REFERENCES public.messages(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.camly_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view transactions they sent or received
CREATE POLICY "Users can view own transactions" 
ON public.camly_transactions 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert transactions where they are the sender
CREATE POLICY "Users can create transactions as sender" 
ON public.camly_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Create index for faster queries
CREATE INDEX idx_camly_transactions_sender ON public.camly_transactions(sender_id);
CREATE INDEX idx_camly_transactions_receiver ON public.camly_transactions(receiver_id);
CREATE INDEX idx_camly_transactions_created_at ON public.camly_transactions(created_at DESC);