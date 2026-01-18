-- Function to increment friends_count
CREATE OR REPLACE FUNCTION public.increment_friends_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET friends_count = COALESCE(friends_count, 0) + 1 
  WHERE id = p_user_id;
END;
$$;

-- Function to decrement friends_count
CREATE OR REPLACE FUNCTION public.decrement_friends_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET friends_count = GREATEST(COALESCE(friends_count, 0) - 1, 0) 
  WHERE id = p_user_id;
END;
$$;

-- Sync friends_count based on actual accepted friendships
UPDATE profiles p
SET friends_count = (
  SELECT COUNT(*) 
  FROM friendships f 
  WHERE (f.requester_id = p.id OR f.addressee_id = p.id) 
    AND f.status = 'accepted'
);

-- Auto-create friendships for existing mutual follows (users following each other)
INSERT INTO friendships (requester_id, addressee_id, status, accepted_at)
SELECT 
  uf1.follower_id,
  uf1.following_id,
  'accepted',
  NOW()
FROM user_follows uf1
JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
WHERE NOT EXISTS (
  SELECT 1 FROM friendships f 
  WHERE (f.requester_id = uf1.follower_id AND f.addressee_id = uf1.following_id)
     OR (f.requester_id = uf1.following_id AND f.addressee_id = uf1.follower_id)
)
AND uf1.follower_id < uf1.following_id
ON CONFLICT DO NOTHING;

-- Update friends_count again after auto-creating friendships
UPDATE profiles p
SET friends_count = (
  SELECT COUNT(*) 
  FROM friendships f 
  WHERE (f.requester_id = p.id OR f.addressee_id = p.id) 
    AND f.status = 'accepted'
);