import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, ArrowLeft } from 'lucide-react';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

export default function ProfileEdit() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file JPEG, PNG hoặc WebP',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 2MB',
      });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      await uploadAvatar.mutateAsync(file);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải lên ảnh đại diện',
      });
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật hồ sơ',
      });
      navigate('/profile');
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật hồ sơ',
      });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="mx-auto max-w-2xl">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) return null;

  const isLoading = updateProfile.isPending || uploadAvatar.isPending;
  const displayAvatar = avatarPreview || profile.avatar_url;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại hồ sơ
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 cursor-pointer border-4 border-muted transition-opacity hover:opacity-80" onClick={handleAvatarClick}>
                      <AvatarImage src={displayAvatar || ''} alt={formData.full_name} />
                      <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                        {formData.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
                      disabled={isLoading}
                    >
                      {uploadAvatar.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    Click để thay đổi ảnh đại diện (tối đa 2MB)
                  </p>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Họ và tên</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên của bạn"
                    disabled={isLoading}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Vị trí</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Hà Nội, Việt Nam"
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" className="flex-1 gradient-forest" disabled={isLoading}>
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <div className="mt-6">
            <NotificationSettings />
          </div>
        </div>
      </div>
    </Layout>
  );
}
