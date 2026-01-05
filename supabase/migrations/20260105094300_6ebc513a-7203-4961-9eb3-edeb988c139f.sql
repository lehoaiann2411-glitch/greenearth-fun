
-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    UPDATE public.profiles SET friends_count = COALESCE(friends_count, 0) + 1 WHERE id = NEW.requester_id;
    UPDATE public.profiles SET friends_count = COALESCE(friends_count, 0) + 1 WHERE id = NEW.addressee_id;
  ELSIF OLD.status = 'accepted' AND (NEW.status != 'accepted' OR TG_OP = 'DELETE') THEN
    UPDATE public.profiles SET friends_count = GREATEST(COALESCE(friends_count, 0) - 1, 0) WHERE id = OLD.requester_id;
    UPDATE public.profiles SET friends_count = GREATEST(COALESCE(friends_count, 0) - 1, 0) WHERE id = OLD.addressee_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at,
      last_message_preview = LEFT(NEW.content, 100),
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET shares_count = COALESCE(shares_count, 0) + 1 WHERE id = NEW.original_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0) WHERE id = OLD.original_post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
