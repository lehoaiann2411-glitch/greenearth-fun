import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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
      emoji: '📍',
      label: t('impact.map.myLocation', 'Tìm tôi nè!'),
      cuteLabel: 'Tìm tôi nè! 🎯',
      onClick: onMyLocation,
      loading: isLoadingLocation,
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'zoom-home',
      emoji: '🏠',
      label: t('impact.map.zoomHome', 'Zoom gần'),
      cuteLabel: 'Xem gần hơn 🔍',
      onClick: onZoomHome,
      gradient: 'from-orange-400 to-amber-400'
    },
    {
      id: 'overview',
      emoji: '🌏',
      label: t('impact.map.overview', 'Tổng quan'),
      cuteLabel: 'Xem cả Việt Nam 🗺️',
      onClick: onZoomOverview,
      gradient: 'from-green-400 to-emerald-400'
    }
  ];

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'flex flex-col gap-2.5',
          className
        )}
      >
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ 
              delay: 0.4 + index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 15
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={cn(
                    'h-12 w-12 rounded-2xl shadow-lg',
                    'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
                    'border-2 border-white/50 dark:border-gray-700/50',
                    'hover:shadow-xl hover:border-primary/30',
                    'transition-all duration-300',
                    action.loading && 'animate-pulse'
                  )}
                >
                  <motion.span 
                    className="text-xl"
                    animate={action.loading ? { rotate: 360 } : { 
                      y: [0, -2, 0],
                    }}
                    transition={action.loading ? { 
                      repeat: Infinity, 
                      duration: 1, 
                      ease: 'linear' 
                    } : {
                      repeat: Infinity,
                      duration: 2,
                      repeatDelay: 1 + index
                    }}
                  >
                    {action.emoji}
                  </motion.span>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                className="font-medium px-3 py-2 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-primary/20"
              >
                <span className="flex items-center gap-1.5">
                  <span>{action.cuteLabel}</span>
                </span>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </motion.div>
    </TooltipProvider>
  );
}
