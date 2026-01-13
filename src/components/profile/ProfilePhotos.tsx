import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Image as ImageIcon, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserMedia, type UserMedia } from '@/hooks/useUserMedia';
import { useUploadProfileMedia } from '@/hooks/useUploadProfileMedia';
import { MediaLightbox } from './MediaLightbox';

type FilterType = 'all' | 'post' | 'story' | 'reel';

interface ProfilePhotosProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProfilePhotos({ userId, isOwnProfile }: ProfilePhotosProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: media = [], isLoading } = useUserMedia(userId);
  const uploadMutation = useUploadProfileMedia();

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(item => item.source === filter);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSourceIcon = (source: UserMedia['source']) => {
    switch (source) {
      case 'post': return '📝';
      case 'story': return '⭐';
      case 'reel': return '🎬';
    }
  };

  const filterOptions: { key: FilterType; label: string; icon?: string }[] = [
    { key: 'all', label: t('profile.photos.filterAll', 'Tất cả') },
    { key: 'post', label: t('profile.photos.filterPosts', 'Bài viết'), icon: '📝' },
    { key: 'story', label: t('profile.photos.filterStories', 'Tin'), icon: '⭐' },
    { key: 'reel', label: t('profile.photos.filterReels', 'Reels'), icon: '🎬' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        {/* Header with title and upload button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t('profile.photos.title', 'Ảnh và Video')}
          </h3>
          
          {isOwnProfile && (
            <Button 
              size="sm" 
              onClick={handleUploadClick}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {t('profile.photos.upload', 'Tải lên')}
            </Button>
          )}
        </div>

        {/* Filter badges */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <Badge
              key={option.key}
              variant={filter === option.key ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => setFilter(option.key)}
            >
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
              {option.key !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({media.filter(m => m.source === option.key).length})
                </span>
              )}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredMedia.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {t('profile.photos.empty', 'Chưa có ảnh hoặc video nào')}
            </p>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleUploadClick}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('profile.photos.uploadFirst', 'Tải lên ảnh đầu tiên')}
              </Button>
            )}
          </div>
        ) : (
          /* Media grid */
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filteredMedia.map((item, index) => (
              <div
                key={item.id}
                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group bg-muted"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={item.thumbnail_url || item.url}
                  alt=""
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />

                {/* Video overlay */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </div>
                )}

                {/* Source label */}
                <div className="absolute bottom-1 left-1 text-sm bg-black/50 px-1.5 py-0.5 rounded">
                  {getSourceIcon(item.source)}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        multiple
        hidden
        onChange={handleFileChange}
      />

      {/* Lightbox */}
      <MediaLightbox
        media={filteredMedia}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </Card>
  );
}
