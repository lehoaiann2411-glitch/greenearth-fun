import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Users, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Campaign, CATEGORY_LABELS } from '@/hooks/useCampaigns';

interface CampaignCardProps {
  campaign: Campaign;
}

const categoryColors: Record<string, string> = {
  tree_planting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cleanup: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  recycling: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  awareness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = Math.min(
    ((campaign.participants_count || 0) / campaign.target_participants) * 100,
    100
  );
  
  const startDate = new Date(campaign.start_date);
  const isUpcoming = startDate > new Date();

  return (
    <Link to={`/campaigns/${campaign.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
        <div className="relative h-48 overflow-hidden">
          {campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <Leaf className="h-16 w-16 text-primary/50" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={categoryColors[campaign.category]}>
              {CATEGORY_LABELS[campaign.category]}
            </Badge>
            {isUpcoming && (
              <Badge variant="secondary">Sắp diễn ra</Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              +{campaign.green_points_reward} điểm
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          
          {campaign.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {campaign.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>
                {format(startDate, 'dd MMM yyyy', { locale: vi })}
              </span>
            </div>
            
            {campaign.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{campaign.location}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {campaign.participants_count || 0}/{campaign.target_participants}
                </span>
              </div>
              {campaign.creator && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={campaign.creator.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {campaign.creator.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {campaign.creator.full_name}
                  </span>
                </div>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
