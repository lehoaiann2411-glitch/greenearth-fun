-- Add columns for storing live stream recordings
ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS recording_duration INTEGER,
ADD COLUMN IF NOT EXISTS is_saved_as_post BOOLEAN DEFAULT false;