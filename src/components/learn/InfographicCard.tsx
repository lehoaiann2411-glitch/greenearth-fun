import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, Eye, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EducationalContent } from '@/hooks/useEducationalContent';

interface InfographicCardProps {
  content: EducationalContent;
  onClick: () => void;
  isViewed?: boolean;
}

export function InfographicCard({ content, onClick, isViewed }: InfographicCardProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] bg-muted">
        {content.thumbnail_url || content.media_url ? (
          <img 
            src={content.thumbnail_url || content.media_url} 
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-6xl">📊</span>
          </div>
        )}
        
        {/* Zoom overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Viewed badge */}
        {isViewed && (
          <Badge 
            className="absolute top-2 right-2 bg-green-500"
          >
            ✓ Viewed
          </Badge>
        )}

        {/* Category badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-black/70 text-white"
        >
          Infographic
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {isVi && content.title_vi ? content.title_vi : content.title}
        </h3>

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
