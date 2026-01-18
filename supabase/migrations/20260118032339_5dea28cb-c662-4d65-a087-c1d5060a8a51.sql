-- Add notification_preferences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "follows": true,
  "friend_requests": true,
  "messages": true,
  "likes": true,
  "comments": true,
  "shares": true,
  "campaigns": true,
  "rewards": true
}'::jsonb;