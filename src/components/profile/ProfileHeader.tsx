import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Edit, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Calendar, MessageCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { AddFriendButton } from './AddFriendButton';
import { OnlineIndicator } from '@/components/messages/OnlineIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatCamly } from '@/lib/camlyCoin';
import { ProfilePhotoLightbox } from './ProfilePhotoLightbox';
import { FollowersModal } from './FollowersModal';
import { useMutualFollowers } from '@/hooks/useMutualFollowers';
import { format, isValid } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
interface ProfileHeaderProps {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    cover_photo_url?: string | null;
    bio: string | null;
    location: string | null;
    work?: string | null;
    education?: string | null;
    website?: string | null;
    trees_planted: number;
    campaigns_joined: number;
    friends_count?: number;
    followers_count?: number;
    following_count?: number;
    camly_balance?: number;
    created_at: string;
  };
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formatJoinedDate = () => {
    try {
      const date = new Date(profile.created_at);
      if (!isValid(date)) return t('common.unknown');
      const locale = getDateLocale(i18n.language);
      return format(date, 'MMMM yyyy', { locale });
    } catch {
      return t('common.unknown');
    }
  };
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<'avatar' | 'cover' | null>(null);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  const { data: mutualFollowers } = useMutualFollowers(profile.id);
  const camlyBalance = profile.camly_balance ?? 0;
  const defaultCover = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80';

  const handleMessageClick = () => {
    navigate(`/messages?userId=${profile.id}`);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Only JPEG, PNG or WebP files allowed' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Error', description: 'File size must be under 5MB' });
      return;
    }

    setIsUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${user.id}/cover_${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cover-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cover-photos')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({ cover_photo_url: publicUrl })
        .eq('id', user.id);

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Success', description: 'Cover photo updated!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload cover photo' });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const currentPhotoUrl = selectedPhoto === 'avatar' 
    ? (profile.avatar_url || '') 
    : (profile.cover_photo_url || defaultCover);

  return (
    <div className="relative">
      {/* Profile Photo Lightbox */}
      <ProfilePhotoLightbox
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        photoUrl={currentPhotoUrl}
        photoType={selectedPhoto || 'avatar'}
        profileId={profile.id}
        profileName={profile.full_name || 'User'}
        profileAvatar={profile.avatar_url || undefined}
      />

      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 rounded-t-xl overflow-hidden">
        <img
          src={profile.cover_photo_url || defaultCover}
          alt="Cover"
          className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
          onClick={() => setSelectedPhoto('cover')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        
        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 gap-2"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              <Camera className="h-4 w-4" />
              {isUploadingCover ? t('common.uploading') : t('profile.editCover')}
            </Button>
          </>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-6">
          <div className="relative">
            <Avatar 
              className="h-32 w-32 border-4 border-background shadow-xl cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedPhoto('avatar')}
            >
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
              <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                {profile.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {!isOwnProfile && (
              <OnlineIndicator userId={profile.id} className="absolute bottom-0 right-4" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-2">
          {isOwnProfile ? (
            <Button asChild variant="outline" className="gap-2">
              <Link to="/profile/edit">
                <Edit className="h-4 w-4" />
                {t('profile.editProfile')}
              </Link>
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleMessageClick}
                className="gap-2 bg-gradient-to-r from-primary to-green-500 hover:from-green-600 hover:to-primary text-white shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                {t('common.message')}
              </Button>
              <AddFriendButton targetUserId={profile.id} />
            </>
          )}
        </div>

        {/* Name & Bio */}
        <div className="mt-12 md:mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {profile.full_name || 'Green Earth User'}
            </h1>
          </div>

          {profile.bio && (
            <p className="mt-2 text-muted-foreground max-w-2xl">{profile.bio}</p>
          )}

          {/* Meta Info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {profile.work && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {profile.work}
              </span>
            )}
            {profile.education && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {profile.education}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                {t('profile.website')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t('profile.joined')} {formatJoinedDate()}
            </span>
          </div>

          {/* Mutual Followers (for other profiles only) */}
          {!isOwnProfile && mutualFollowers && mutualFollowers.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {mutualFollowers.slice(0, 3).map((follower) => (
                  <Avatar key={follower.id} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={follower.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {follower.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span>
                {mutualFollowers.length === 1 
                  ? t('profile.mutualFollowerSingle', { name: mutualFollowers[0].full_name })
                  : t('profile.mutualFollowers', { 
                      name: mutualFollowers[0].full_name, 
                      count: mutualFollowers.length - 1 
                    })
                }
              </span>
            </div>
          )}

          {/* Stats Row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <Link to={`/profile/${profile.id}/friends`} className="hover:underline group">
              <span className="font-bold group-hover:text-primary transition-colors">{profile.friends_count || 0}</span>
              <span className="text-muted-foreground ml-1">{t('friends.friends')}</span>
            </Link>
            
            {/* Followers - clickable */}
            <button 
              onClick={() => {
                setFollowersModalTab('followers');
                setFollowersModalOpen(true);
              }}
              className="hover:underline group"
            >
              <span className="font-bold group-hover:text-primary transition-colors">{profile.followers_count || 0}</span>
              <span className="text-muted-foreground ml-1">{t('friends.followers')}</span>
            </button>
            
            {/* Following - clickable */}
            <button 
              onClick={() => {
                setFollowersModalTab('following');
                setFollowersModalOpen(true);
              }}
              className="hover:underline group"
            >
              <span className="font-bold group-hover:text-primary transition-colors">{profile.following_count || 0}</span>
              <span className="text-muted-foreground ml-1">{t('profile.following')}</span>
            </button>
            
            <span>
              <span className="font-bold">{profile.trees_planted ?? 0}</span>
              <span className="text-muted-foreground ml-1">{t('profile.trees')}</span>
            </span>
            <span>
              <span className="font-bold">{profile.campaigns_joined ?? 0}</span>
              <span className="text-muted-foreground ml-1">{t('profile.campaigns')}</span>
            </span>
            <span className="flex items-center gap-1">
              <CamlyCoinIcon size="sm" />
              <span className="font-bold text-yellow-600 dark:text-yellow-400">{formatCamly(camlyBalance)}</span>
            </span>
          </div>

          {/* Followers Modal */}
          <FollowersModal
            isOpen={followersModalOpen}
            onClose={() => setFollowersModalOpen(false)}
            userId={profile.id}
            userName={profile.full_name || 'User'}
            initialTab={followersModalTab}
          />
        </div>
      </div>
    </div>
  );
}
