import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Youtube, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Influencer {
  id: string;
  name: string;
  bio?: string;
  bio_vi?: string;
  avatar_url?: string;
  cover_url?: string;
  platform: string;
  profile_url?: string;
  follower_count?: string;
  specialty?: string[];
  is_featured: boolean;
}

interface InfluencerCardProps {
  influencer: Influencer;
}

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <span className="text-sm">📱</span>,
  facebook: <span className="text-sm">📘</span>,
};

const platformColors: Record<string, string> = {
  youtube: 'bg-red-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  tiktok: 'bg-black',
  facebook: 'bg-blue-600',
};

export function InfluencerCard({ influencer }: InfluencerCardProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const handleVisit = () => {
    if (influencer.profile_url) {
      window.open(influencer.profile_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Cover image */}
      <div className="relative h-24 bg-gradient-to-br from-primary/30 to-primary/5">
        {influencer.cover_url ? (
          <img 
            src={influencer.cover_url} 
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400/30 to-emerald-500/30" />
        )}

        {/* Featured badge */}
        {influencer.is_featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            ⭐ Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4 -mt-8 relative">
        {/* Avatar */}
        <div className="flex items-end gap-3 mb-3">
          <Avatar className="w-16 h-16 border-4 border-background">
            <AvatarImage src={influencer.avatar_url} alt={influencer.name} />
            <AvatarFallback className="text-lg">
              {influencer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{influencer.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge 
                variant="secondary" 
                className={`${platformColors[influencer.platform] || 'bg-gray-500'} text-white text-xs`}
              >
                {platformIcons[influencer.platform]}
                <span className="ml-1 capitalize">{influencer.platform}</span>
              </Badge>
              {influencer.follower_count && (
                <span>{influencer.follower_count}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {influencer.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {isVi && influencer.bio_vi ? influencer.bio_vi : influencer.bio}
          </p>
        )}

        {/* Specialties */}
        {influencer.specialty && influencer.specialty.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {influencer.specialty.slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {spec.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )}

        {/* Action */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={handleVisit}
          disabled={!influencer.profile_url}
        >
          <ExternalLink className="w-4 h-4" />
          {isVi ? 'Xem trang' : 'Visit Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}
