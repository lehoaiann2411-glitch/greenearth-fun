import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Navigation, Home, Globe, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MapQuickActionsProps {
  onMyLocation: () => void;
  onZoomHome: () => void;
  onZoomOverview: () => void;
  isLoadingLocation?: boolean;
  className?: string;
}

export function MapQuickActions({
  onMyLocation,
  onZoomHome,
  onZoomOverview,
  isLoadingLocation = false,
  className
}: MapQuickActionsProps) {
  const { t } = useTranslation();

  const actions = [
    {
      id: 'my-location',
      icon: Navigation,
      label: t('impact.map.myLocation', 'Vị trí của tôi'),
      onClick: onMyLocation,
      loading: isLoadingLocation
    },
    {
      id: 'zoom-home',
      icon: Home,
      label: t('impact.map.zoomHome', 'Zoom gần'),
      onClick: onZoomHome
    },
    {
      id: 'overview',
      icon: Globe,
      label: t('impact.map.overview', 'Tổng quan'),
      onClick: onZoomOverview
    }
  ];

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'flex flex-col gap-2',
          className
        )}
      >
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={cn(
                    'h-10 w-10 rounded-full shadow-lg bg-background/95 backdrop-blur hover:bg-primary hover:text-primary-foreground transition-all',
                    action.loading && 'animate-pulse'
                  )}
                >
                  <action.icon className={cn(
                    'h-5 w-5',
                    action.loading && 'animate-spin'
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-medium">
                {action.label}
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </motion.div>
    </TooltipProvider>
  );
}
