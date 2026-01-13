import { useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserMedia } from '@/hooks/useUserMedia';

interface MediaLightboxProps {
  media: UserMedia[];
  currentIndex: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function MediaLightbox({ 
  media, 
  currentIndex, 
  onClose, 
  onIndexChange 
}: MediaLightboxProps) {
  const isOpen = currentIndex !== null;
  const currentMedia = currentIndex !== null ? media[currentIndex] : null;

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : media.length - 1;
    onIndexChange(newIndex);
  }, [currentIndex, media.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const newIndex = currentIndex < media.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  }, [currentIndex, media.length, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!currentMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full bg-black/95 border-none p-0 flex flex-col"
        hideClose
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
          {/* Counter */}
          <div className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
            {currentIndex! + 1} / {media.length}
          </div>
          
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation buttons */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Media content */}
        <div className="flex-1 flex items-center justify-center p-4 pt-16 pb-24">
          {currentMedia.type === 'video' ? (
            <video
              key={currentMedia.id}
              src={currentMedia.url}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-lg"
            />
          ) : (
            <img
              key={currentMedia.id}
              src={currentMedia.url}
              alt=""
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          )}
        </div>

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
            <div className="flex gap-2 overflow-x-auto justify-center max-w-full px-4">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all",
                    index === currentIndex 
                      ? "ring-2 ring-primary scale-105" 
                      : "opacity-60 hover:opacity-100"
                  )}
                  onClick={() => onIndexChange(index)}
                >
                  <img
                    src={item.thumbnail_url || item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
