-- Phase 1: Add Web3 fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS green_reputation INTEGER DEFAULT 0;

-- Add on-chain metadata to green_nfts
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS token_id TEXT;
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS contract_address TEXT;
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS transaction_hash TEXT;
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS metadata_uri TEXT;
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE green_nfts ADD COLUMN IF NOT EXISTS co2_absorbed NUMERIC DEFAULT 0;

-- Daily Quests table
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_vi TEXT,
  description TEXT,
  description_vi TEXT,
  quest_type TEXT NOT NULL,
  points_reward INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests are viewable by everyone" ON daily_quests
FOR SELECT USING (true);

-- User Quest Progress table
CREATE TABLE IF NOT EXISTS user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quest_id UUID REFERENCES daily_quests(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  quest_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, quest_id, quest_date)
);

ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quest progress" ON user_quest_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest progress" ON user_quest_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_vi TEXT,
  description TEXT,
  description_vi TEXT,
  icon TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone" ON badges
FOR SELECT USING (true);

-- User Badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges are viewable by everyone" ON user_badges
FOR SELECT USING (true);

CREATE POLICY "System can insert user badges" ON user_badges
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_vi TEXT,
  description TEXT,
  description_vi TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  max_attendees INTEGER,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON events
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their events" ON events
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their events" ON events
FOR DELETE USING (auth.uid() = created_by);

-- Event Attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rsvp_status TEXT DEFAULT 'interested',
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event attendees are viewable by everyone" ON event_attendees
FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_attendees
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their attendance" ON event_attendees
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their attendance" ON event_attendees
FOR DELETE USING (auth.uid() = user_id);

-- Insert default daily quests
INSERT INTO daily_quests (title, title_vi, description, description_vi, quest_type, points_reward) VALUES
('Daily Check-in', 'Điểm danh hàng ngày', 'Check in to the app daily', 'Điểm danh mỗi ngày', 'daily_check_in', 5),
('Share a Post', 'Chia sẻ bài viết', 'Share a post with the community', 'Chia sẻ bài viết với cộng đồng', 'share_post', 3),
('Like 5 Posts', 'Thích 5 bài viết', 'Like 5 posts from other users', 'Thích 5 bài viết của người dùng khác', 'like_posts', 3),
('Read Eco Fact', 'Đọc kiến thức xanh', 'Learn a new environmental fact', 'Học một kiến thức mới về môi trường', 'read_eco_fact', 2);

-- Insert default badges
INSERT INTO badges (name, name_vi, description, description_vi, icon, requirement_type, requirement_value) VALUES
('First Tree', 'Cây Đầu Tiên', 'Planted your first tree', 'Trồng cây đầu tiên của bạn', 'TreePine', 'trees_planted', 1),
('Tree Guardian', 'Người Giữ Rừng', 'Planted 10 trees', 'Trồng 10 cây', 'Trees', 'trees_planted', 10),
('Forest Creator', 'Người Tạo Rừng', 'Planted 50 trees', 'Trồng 50 cây', 'TreeDeciduous', 'trees_planted', 50),
('Campaign Hero', 'Anh Hùng Chiến Dịch', 'Joined 5 campaigns', 'Tham gia 5 chiến dịch', 'Award', 'campaigns_joined', 5),
('Green Warrior', 'Chiến Binh Xanh', 'Earned 100 green points', 'Đạt 100 điểm xanh', 'Shield', 'green_points', 100),
('Eco Master', 'Bậc Thầy Xanh', 'Earned 500 green points', 'Đạt 500 điểm xanh', 'Crown', 'green_points', 500),
('Community Star', 'Ngôi Sao Cộng Đồng', 'Created 10 posts', 'Tạo 10 bài viết', 'Star', 'posts_created', 10);