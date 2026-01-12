import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const TOUR_STORAGE_KEY = 'map_tour_completed';

interface TourStep {
  id: string;
  emoji: string;
  mascotMood: string;
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
      emoji: '🌳',
      mascotMood: '👋',
      title: t('impact.map.tour.welcome', 'Xin chào! Mình là Cây Xanh! 🌱'),
      description: t('impact.map.tour.welcomeDesc', 'Để mình hướng dẫn bạn khám phá bản đồ trồng cây siêu cute này nhé!'),
      position: 'center'
    },
    {
      id: 'search',
      emoji: '🔍',
      mascotMood: '🤔',
      title: t('impact.map.tour.search', 'Tìm kiếm địa điểm'),
      description: t('impact.map.tour.searchDesc', 'Gõ tên địa điểm vào ô tìm kiếm, bản đồ sẽ bay đến đó ngay! Thử xem nè~'),
      position: 'top-left'
    },
    {
      id: 'markers',
      emoji: '📍',
      mascotMood: '😊',
      title: t('impact.map.tour.markers', 'Click vào các điểm màu xanh'),
      description: t('impact.map.tour.markersDesc', 'Mỗi điểm là một khu rừng hoặc chiến dịch trồng cây. Click để xem có bao nhiêu cây đã trồng!'),
      position: 'center'
    },
    {
      id: 'draw',
      emoji: '✏️',
      mascotMood: '🎨',
      title: t('impact.map.tour.draw', 'Vẽ khu vực của bạn'),
      description: t('impact.map.tour.drawDesc', 'Bấm nút Vẽ rồi click từng điểm trên bản đồ để tạo khu vực rừng mới. Dễ lắm!'),
      position: 'bottom-left'
    },
    {
      id: 'enjoy',
      emoji: '🎉',
      mascotMood: '🥳',
      title: t('impact.map.tour.enjoy', 'Sẵn sàng khám phá!'),
      description: t('impact.map.tour.enjoyDesc', 'Giờ thì bạn đã sẵn sàng rồi! Hãy khám phá và góp phần bảo vệ rừng xanh nhé! 💚'),
      position: 'center'
    }
  ];

  // Check if tour was completed
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
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
    // Celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#f59e0b']
    });

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

  const getPositionClasses = (position: TourStep['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'bottom-left':
        return 'bottom-24 left-4';
      case 'bottom-right':
        return 'bottom-24 right-4';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with subtle pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Speech Bubble Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'fixed z-50 w-[90%] max-w-[360px]',
              getPositionClasses(step.position),
              className
            )}
          >
            {/* Main Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-4 border-primary/20 overflow-hidden">
              {/* Gradient header */}
              <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
              
              <div className="p-5">
                {/* Close button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Mascot and Emoji */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative"
                  >
                    {/* Mascot container */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800">
                      <motion.span 
                        className="text-4xl"
                        animate={{ 
                          y: [0, -5, 0],
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2,
                          repeatDelay: 1
                        }}
                      >
                        🌱
                      </motion.span>
                    </div>
                    
                    {/* Mood bubble */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-2 border-primary/20"
                    >
                      <span className="text-xl">{step.mascotMood}</span>
                    </motion.div>
                    
                    {/* Step emoji */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <span className="text-lg">{step.emoji}</span>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Content */}
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center space-y-2 mb-5"
                >
                  <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>

                {/* Progress - Tree growth visualization */}
                <div className="flex justify-center gap-2 mb-5">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'text-lg transition-all duration-300',
                        index < currentStep && 'opacity-100',
                        index === currentStep && 'scale-125',
                        index > currentStep && 'opacity-30 grayscale'
                      )}
                    >
                      {index === 0 && '🌱'}
                      {index === 1 && '🌿'}
                      {index === 2 && '🌳'}
                      {index === 3 && '🌲'}
                      {index === 4 && '🌴'}
                    </motion.div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="gap-1 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('common.previous', 'Trước')}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkip}
                    className="rounded-xl text-muted-foreground"
                  >
                    {t('impact.map.tour.skip', 'Bỏ qua')}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className={cn(
                      'gap-1 rounded-xl',
                      currentStep === steps.length - 1 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        : ''
                    )}
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <span>🎉</span>
                        <span>{t('impact.map.tour.finish', 'Bắt đầu!')}</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{t('common.next', 'Tiếp')}</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Speech bubble tail */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-900 rotate-45 border-r-4 border-b-4 border-primary/20" />
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
