import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Smile, MapPin, X, Loader2, Coins, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreateGroupPost } from '@/hooks/useGroupPosts';
import { supabase } from '@/integrations/supabase/client';
import { CAMLY_REWARDS, FEELINGS } from '@/lib/camlyCoin';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CreateGroupPostProps {
  groupId: string;
  isAdmin?: boolean;
}

export function CreateGroupPost({ groupId, isAdmin = false }: CreateGroupPostProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const createPost = useCreateGroupPost();
  
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const reward = images.length > 0 ? CAMLY_REWARDS.GROUP_POST_WITH_IMAGE : CAMLY_REWARDS.GROUP_POST;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('group-images')
          .getPublicUrl(fileName);
        newImages.push(publicUrl);
      }
    }

    setImages([...images, ...newImages]);
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;

    await createPost.mutateAsync({
      group_id: groupId,
      content: content.trim(),
      media_urls: images,
      feeling: feeling || undefined,
      is_announcement: isAnnouncement,
    });

    setContent('');
    setImages([]);
    setFeeling(null);
    setIsAnnouncement(false);
  };

  const selectedFeeling = FEELINGS.find(f => f.id === feeling);

  return (
    <Card className="border-white/20 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Reward Banner */}
        <div className="mb-3 p-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center gap-2 text-sm">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-medium">Đăng bài: +{reward.toLocaleString()} 🪙</span>
        </div>

        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Feeling Badge */}
            {selectedFeeling && (
              <Badge variant="secondary" className="gap-1">
                {selectedFeeling.emoji} Đang cảm thấy {selectedFeeling.label_vi}
                <button onClick={() => setFeeling(null)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Textarea
              placeholder="Chia sẻ với nhóm..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0 text-base"
            />

            {/* Images Preview */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Announcement Toggle (Admin only) */}
            {isAdmin && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200/50">
                <Megaphone className="h-4 w-4 text-amber-600" />
                <Label htmlFor="announcement" className="text-sm text-amber-800 flex-1">
                  Đánh dấu là thông báo
                </Label>
                <Switch
                  id="announcement"
                  checked={isAnnouncement}
                  onCheckedChange={setIsAnnouncement}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4 text-primary" />
                  )}
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Smile className="h-4 w-4 text-amber-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="grid grid-cols-4 gap-1">
                      {FEELINGS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFeeling(f.id)}
                          className={`p-2 rounded hover:bg-muted text-xl ${feeling === f.id ? 'bg-primary/10' : ''}`}
                          title={f.label_vi}
                        >
                          {f.emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && images.length === 0) || createPost.isPending}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {createPost.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Coins className="h-4 w-4 mr-2" />
                )}
                Đăng (+{reward.toLocaleString()} 🪙)
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
