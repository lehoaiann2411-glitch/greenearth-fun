-- Add region and forest_type columns to campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS forest_type text;

-- Add constraint for valid regions
DO $$ BEGIN
  ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_region_check 
  CHECK (region IS NULL OR region IN ('north', 'central', 'south'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add constraint for valid forest types
DO $$ BEGIN
  ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_forest_type_check 
  CHECK (forest_type IS NULL OR forest_type IN ('mangrove', 'pine', 'tropical'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed 10 real tree planting locations in Vietnam
INSERT INTO public.campaigns (
  title, description, category, location, latitude, longitude, 
  region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward
)
SELECT 
  'Rừng Ngập Mặn Cần Giờ', 
  'Phục hồi rừng ngập mặn ven biển - khu dự trữ sinh quyển UNESCO', 
  'tree_planting'::campaign_category, 
  'Cần Giờ, TP.HCM', 
  10.4114, 106.9580, 
  'south', 'mangrove', 
  5000, '2024-01-15'::date, '2025-01-15'::date, 
  'active'::campaign_status, 
  (SELECT id FROM auth.users LIMIT 1), 
  100
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE latitude IS NOT NULL LIMIT 1);

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Vườn Quốc Gia Cúc Phương', 'Trồng cây phục hồi rừng nhiệt đới nguyên sinh lâu đời nhất Việt Nam', 'tree_planting'::campaign_category, 'Ninh Bình', 20.2500, 105.6167, 'north', 'tropical', 3200, '2024-03-20'::date, '2025-03-20'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 80
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Vườn Quốc Gia Cúc Phương');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Bán Đảo Sơn Trà', 'Bảo vệ và mở rộng rừng nguyên sinh - nơi cư trú của Voọc chà vá chân nâu', 'tree_planting'::campaign_category, 'Đà Nẵng', 16.1186, 108.2778, 'central', 'tropical', 2500, '2024-02-10'::date, '2025-02-10'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 75
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Bán Đảo Sơn Trà');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Rừng Ngập Mặn Xuân Thủy', 'Vùng đất ngập nước Ramsar đầu tiên của Đông Nam Á', 'tree_planting'::campaign_category, 'Nam Định', 20.2500, 106.5500, 'north', 'mangrove', 4000, '2023-11-01'::date, '2024-11-01'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 90
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Rừng Ngập Mặn Xuân Thủy');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Vườn Quốc Gia Phong Nha-Kẻ Bàng', 'Rừng đá vôi nhiệt đới - Di sản thiên nhiên thế giới UNESCO', 'tree_planting'::campaign_category, 'Quảng Bình', 17.5000, 106.1500, 'central', 'tropical', 6000, '2023-09-15'::date, '2024-09-15'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 120
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Vườn Quốc Gia Phong Nha-Kẻ Bàng');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Rừng Tràm Trà Sư', 'Rừng tràm ngập nước độc đáo vùng đồng bằng sông Cửu Long', 'tree_planting'::campaign_category, 'An Giang', 10.6667, 105.0833, 'south', 'mangrove', 1800, '2024-04-01'::date, '2025-04-01'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 60
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Rừng Tràm Trà Sư');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Vườn Quốc Gia Phú Quốc', 'Rừng nhiệt đới trên đảo ngọc - bảo tồn đa dạng sinh học biển đảo', 'tree_planting'::campaign_category, 'Kiên Giang', 10.2167, 103.9500, 'south', 'tropical', 2000, '2024-05-10'::date, '2025-05-10'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 70
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Vườn Quốc Gia Phú Quốc');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Vườn Quốc Gia Ba Vì', 'Rừng thông núi cao - lá phổi xanh của thủ đô Hà Nội', 'tree_planting'::campaign_category, 'Hà Nội', 21.0833, 105.3667, 'north', 'pine', 3500, '2023-12-01'::date, '2024-12-01'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 85
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Vườn Quốc Gia Ba Vì');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Rừng Thông Đà Lạt', 'Rừng thông cao nguyên Lâm Viên - biểu tượng của thành phố ngàn hoa', 'tree_planting'::campaign_category, 'Lâm Đồng', 11.9367, 108.4431, 'central', 'pine', 4500, '2024-01-01'::date, '2025-01-01'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 95
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Rừng Thông Đà Lạt');

INSERT INTO public.campaigns (title, description, category, location, latitude, longitude, region, forest_type, target_trees, start_date, end_date, status, creator_id, green_points_reward)
SELECT 'Vườn Quốc Gia Tam Đảo', 'Rừng mưa nhiệt đới núi cao - khu bảo tồn thiên nhiên phía Bắc', 'tree_planting'::campaign_category, 'Vĩnh Phúc', 21.4667, 105.6500, 'north', 'tropical', 2800, '2024-02-15'::date, '2025-02-15'::date, 'active'::campaign_status, (SELECT id FROM auth.users LIMIT 1), 78
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.campaigns WHERE title = 'Vườn Quốc Gia Tam Đảo');