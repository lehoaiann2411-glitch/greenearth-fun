import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Image, Loader2, Globe, Lock, Coins, MapPin } from 'lucide-react';
import { useCreateGroup, GROUP_CATEGORIES, VIETNAM_LOCATIONS, GROUP_EMOJIS } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

export default function GroupCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createGroup = useCreateGroup();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [iconEmoji, setIconEmoji] = useState('🌳');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('general');
  const [isUploading, setIsUploading] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('group-images')
      .upload(fileName, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(fileName);
      setCoverImage(publicUrl);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const group = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      cover_image_url: coverImage || undefined,
      icon_emoji: iconEmoji,
      privacy,
      location: location || undefined,
      category,
    });

    if (group) {
      navigate(`/groups/${group.id}`);
    }
  };

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card className="border-white/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🌳 Tạo nhóm mới
            </CardTitle>
            <p className="text-muted-foreground flex items-center gap-1">
              Tạo cộng đồng và nhận +{CAMLY_REWARDS.GROUP_CREATE.toLocaleString()} <CamlyCoinInline />
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Ảnh bìa</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors overflow-hidden"
                >
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <Image className="h-8 w-8 mb-2" />
                          <span>Nhấn để tải ảnh bìa</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Icon & Name */}
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-16 h-16 text-3xl">
                        {iconEmoji}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="grid grid-cols-5 gap-1">
                        {GROUP_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setIconEmoji(emoji)}
                            className={`p-2 rounded hover:bg-muted text-2xl ${iconEmoji === emoji ? 'bg-primary/10' : ''}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Tên nhóm *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Trồng cây Hà Nội"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả về nhóm của bạn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <Label>Quyền riêng tư</Label>
                <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as 'public' | 'private')}>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="public" id="public" className="mt-1" />
                    <Label htmlFor="public" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Globe className="h-4 w-4 text-primary" />
                        Công khai
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">
                        Ai cũng có thể xem và tham gia nhóm
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="private" id="private" className="mt-1" />
                    <Label htmlFor="private" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Lock className="h-4 w-4 text-amber-500" />
                        Riêng tư
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">
                        Cần được duyệt để tham gia nhóm
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {'emoji' in cat && <span className="mr-2">{cat.emoji}</span>}
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Địa điểm</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIETNAM_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        <MapPin className="h-4 w-4 inline mr-2" />
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!name.trim() || createGroup.isPending}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {createGroup.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Coins className="h-4 w-4 mr-2" />
                )}
                Tạo nhóm (+{CAMLY_REWARDS.GROUP_CREATE.toLocaleString()} <CamlyCoinInline />)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
