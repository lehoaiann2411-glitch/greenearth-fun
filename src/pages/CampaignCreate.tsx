import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCampaign, uploadCampaignImage, CATEGORY_LABELS, CampaignCategory } from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateCampaign();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tree_planting' as CampaignCategory,
    location: '',
    start_date: '',
    end_date: '',
    target_participants: 10,
    target_trees: 0,
    green_points_reward: 10,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setIsUploading(true);
      let image_url: string | undefined;
      
      if (imageFile) {
        image_url = await uploadCampaignImage(imageFile);
      }

      await createMutation.mutateAsync({
        ...formData,
        image_url,
      });
      
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h2 className="text-xl font-semibold mb-4">Bạn cần đăng nhập để tạo chiến dịch</h2>
          <Button asChild>
            <Link to="/auth">Đăng nhập</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Tạo Chiến Dịch Mới</CardTitle>
            <CardDescription>
              Khởi tạo chiến dịch bảo vệ môi trường và kêu gọi mọi người tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Hình ảnh chiến dịch</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click để tải ảnh lên
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tên chiến dịch *</Label>
                <Input
                  id="title"
                  placeholder="VD: Trồng 1000 cây xanh tại Hà Nội"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về chiến dịch..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CampaignCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  placeholder="VD: Công viên Thống Nhất, Hà Nội"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Date Range */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Ngày bắt đầu *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Ngày kết thúc *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Targets */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_participants">Mục tiêu người tham gia *</Label>
                  <Input
                    id="target_participants"
                    type="number"
                    min={1}
                    value={formData.target_participants}
                    onChange={(e) => setFormData({ ...formData, target_participants: parseInt(e.target.value) || 10 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_trees">Mục tiêu cây trồng</Label>
                  <Input
                    id="target_trees"
                    type="number"
                    min={0}
                    value={formData.target_trees}
                    onChange={(e) => setFormData({ ...formData, target_trees: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Green Points Reward */}
              <div className="space-y-2">
                <Label htmlFor="green_points_reward">Điểm thưởng (Green Points)</Label>
                <Input
                  id="green_points_reward"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.green_points_reward}
                  onChange={(e) => setFormData({ ...formData, green_points_reward: parseInt(e.target.value) || 10 })}
                />
                <p className="text-sm text-muted-foreground">
                  Số điểm xanh người tham gia nhận được khi hoàn thành
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/campaigns')}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || isUploading}
                >
                  {(createMutation.isPending || isUploading) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Tạo chiến dịch
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
