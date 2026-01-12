-- Xóa participants của 10 chiến dịch seed trước
DELETE FROM public.campaign_participants 
WHERE campaign_id IN (
  SELECT id FROM public.campaigns 
  WHERE title IN (
    'Vườn Quốc Gia Phong Nha-Kẻ Bàng',
    'Rừng Ngập Mặn Xuân Thủy',
    'Vườn Quốc Gia Ba Vì',
    'Rừng Thông Đà Lạt',
    'Rừng Ngập Mặn Cần Giờ',
    'Bán Đảo Sơn Trà',
    'Vườn Quốc Gia Tam Đảo',
    'Vườn Quốc Gia Cúc Phương',
    'Rừng Tràm Trà Sư',
    'Vườn Quốc Gia Phú Quốc'
  )
);

-- Xóa 10 chiến dịch seed data
DELETE FROM public.campaigns 
WHERE title IN (
  'Vườn Quốc Gia Phong Nha-Kẻ Bàng',
  'Rừng Ngập Mặn Xuân Thủy',
  'Vườn Quốc Gia Ba Vì',
  'Rừng Thông Đà Lạt',
  'Rừng Ngập Mặn Cần Giờ',
  'Bán Đảo Sơn Trà',
  'Vườn Quốc Gia Tam Đảo',
  'Vườn Quốc Gia Cúc Phương',
  'Rừng Tràm Trà Sư',
  'Vườn Quốc Gia Phú Quốc'
);

-- Tạo bảng forest_areas để lưu polygon khu vực rừng
CREATE TABLE public.forest_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  area_hectares DECIMAL(10,2),
  forest_type TEXT,
  trees_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forest_areas ENABLE ROW LEVEL SECURITY;

-- Anyone can view forest areas
CREATE POLICY "Anyone can view forest areas"
ON public.forest_areas FOR SELECT USING (true);

-- Authenticated users can create forest areas
CREATE POLICY "Authenticated users can create forest areas"
ON public.forest_areas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update own forest areas
CREATE POLICY "Users can update own forest areas"
ON public.forest_areas FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete own forest areas
CREATE POLICY "Users can delete own forest areas"
ON public.forest_areas FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Trigger để update updated_at
CREATE TRIGGER update_forest_areas_updated_at
BEFORE UPDATE ON public.forest_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();