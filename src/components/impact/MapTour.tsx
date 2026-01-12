import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, MapPin, Pencil, Search, TreePine } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'map_tour_completed';

interface TourStep {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface MapTourProps {
  onComplete: () => void;
  className?: string;
}

export function MapTour({ onComplete, className }: MapTourProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      icon: TreePine,
      title: t('impact.map.tour.welcome', 'Chào mừng đến Bản đồ Trồng cây! 🌳'),
      description: t('impact.map.tour.welcomeDesc', 'Đây là nơi bạn có thể khám phá các chiến dịch trồng cây trên khắp Việt Nam.'),
      position: 'center'
    },
    {
      id: 'search',
      icon: Search,
      title: t('impact.map.tour.search', 'Tìm kiếm địa điểm'),
      description: t('impact.map.tour.searchDesc', 'Sử dụng thanh tìm kiếm để tìm địa điểm cụ thể. Bản đồ sẽ bay đến vị trí bạn chọn.'),
      position: 'top-left'
    },
    {
      id: 'markers',
      icon: MapPin,
      title: t('impact.map.tour.markers', 'Click vào markers'),
      description: t('impact.map.tour.markersDesc', 'Mỗi marker đại diện cho một điểm trồng cây. Click để xem chi tiết và chỉ đường.'),
      position: 'center'
    },
    {
      id: 'draw',
      icon: Pencil,
      title: t('impact.map.tour.draw', 'Vẽ khu vực rừng'),
      description: t('impact.map.tour.drawDesc', 'Bạn có thể đánh dấu khu vực rừng mới bằng công cụ Vẽ. Click các điểm trên bản đồ để tạo polygon.'),
      position: 'bottom-left'
    }
  ];

  // Check if tour was completed
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Delay showing tour
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  const getPositionClasses = (position: TourStep['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-16 left-4';
      case 'top-right':
        return 'top-16 right-4';
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'bottom-right':
        return 'bottom-20 right-4';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'fixed z-50 w-[90%] max-w-[350px]',
              getPositionClasses(step.position),
              className
            )}
          >
            <Card className="shadow-2xl border-2 border-primary/20">
              <CardContent className="p-4">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <Icon className="h-8 w-8 text-primary" />
                  </motion.div>
                </div>

                {/* Content */}
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-2 mb-4"
                >
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mb-4">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        index === currentStep ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('common.previous', 'Trước')}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                  >
                    {t('impact.map.tour.skip', 'Bỏ qua')}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-1"
                  >
                    {currentStep === steps.length - 1 
                      ? t('impact.map.tour.finish', 'Bắt đầu')
                      : t('common.next', 'Tiếp')
                    }
                    {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to check if tour should be shown
export function useMapTourStatus() {
  const [shouldShowTour, setShouldShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    setShouldShowTour(!completed);
  }, []);

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setShouldShowTour(true);
  };

  return { shouldShowTour, resetTour };
}
