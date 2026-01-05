import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Calendar, Users } from 'lucide-react';
import { getRankByPoints } from '@/lib/greenRanks';
import { useAuth } from '@/contexts/AuthContext';
import { AddFriendButton } from './AddFriendButton';
import { OnlineIndicator } from '@/components/messages/OnlineIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
    green_points: number;
    trees_planted: number;
    campaigns_joined: number;
    friends_count?: number;
    created_at: string;
  };
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const currentRank = getRankByPoints(profile.green_points ?? 0);
  const RankIcon = currentRank.icon;

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
      const filePath = `${user.id}/cover.${fileExt}`;

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

  const defaultCover = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80';

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 rounded-t-xl overflow-hidden">
        <img
          src={profile.cover_photo_url || defaultCover}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
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
              {isUploadingCover ? 'Uploading...' : 'Edit Cover'}
            </Button>
          </>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-6">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
              <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                {profile.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full ${currentRank.bgClass} ${currentRank.colorClass} ring-4 ring-background`}>
              <RankIcon className="h-5 w-5" />
            </div>
            {!isOwnProfile && (
              <OnlineIndicator userId={profile.id} className="absolute bottom-0 right-8" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-2">
          {isOwnProfile ? (
            <Button asChild variant="outline" className="gap-2">
              <Link to="/profile/edit">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          ) : (
            <AddFriendButton targetUserId={profile.id} />
          )}
        </div>

        {/* Name & Bio */}
        <div className="mt-12 md:mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {profile.full_name || 'Green Earth User'}
            </h1>
            <Badge variant="secondary" className={currentRank.colorClass}>
              {currentRank.name}
            </Badge>
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
                Website
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Stats Row */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <Link to={`/profile/${profile.id}/friends`} className="hover:underline">
              <span className="font-bold">{profile.friends_count || 0}</span>
              <span className="text-muted-foreground ml-1">Friends</span>
            </Link>
            <span>
              <span className="font-bold">{profile.trees_planted ?? 0}</span>
              <span className="text-muted-foreground ml-1">Trees</span>
            </span>
            <span>
              <span className="font-bold">{profile.campaigns_joined ?? 0}</span>
              <span className="text-muted-foreground ml-1">Campaigns</span>
            </span>
            <span>
              <span className="font-bold">{(profile.green_points ?? 0).toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">Points</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
