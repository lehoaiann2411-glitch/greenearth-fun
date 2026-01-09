import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Eye, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EducationalContent } from '@/hooks/useEducationalContent';

interface VideoCardProps {
  content: EducationalContent;
  onClick: () => void;
  isViewed?: boolean;
}

export function VideoCard({ content, onClick, isViewed }: VideoCardProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted">
        {content.thumbnail_url ? (
          <img 
            src={content.thumbnail_url} 
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary/50" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary fill-primary ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        {content.duration_seconds && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2 bg-black/70 text-white"
          >
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(content.duration_seconds)}
          </Badge>
        )}

        {/* Viewed badge */}
        {isViewed && (
          <Badge 
            className="absolute top-2 right-2 bg-green-500"
          >
            ✓ Watched
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {isVi && content.title_vi ? content.title_vi : content.title}
        </h3>
        
        {content.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {isVi && content.description_vi ? content.description_vi : content.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{content.view_count}</span>
          </div>
          
          <Badge variant="outline" className="gap-1">
            <Coins className="w-3 h-3 text-yellow-500" />
            +{content.points_reward}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
