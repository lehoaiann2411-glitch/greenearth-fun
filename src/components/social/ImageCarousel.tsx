import { useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Setup onSelect listener
  useState(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  });

  if (images.length === 0) return null;

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <>
        <div 
          className={cn("relative cursor-pointer group", className)}
          onClick={() => setFullscreenImage(images[0])}
        >
          <img
            src={images[0]}
            alt="Post image"
            className="w-full rounded-lg object-cover max-h-[500px]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <FullscreenViewer 
          image={fullscreenImage} 
          onClose={() => setFullscreenImage(null)} 
        />
      </>
    );
  }

  // Grid layout for 2-4 images
  if (images.length >= 2 && images.length <= 4) {
    return (
      <>
        <div className={cn(
          "grid gap-1 rounded-lg overflow-hidden",
          images.length === 2 && "grid-cols-2",
          images.length === 3 && "grid-cols-2",
          images.length === 4 && "grid-cols-2",
          className
        )}>
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                "relative cursor-pointer group overflow-hidden",
                images.length === 3 && index === 0 && "row-span-2",
                "aspect-square"
              )}
              onClick={() => setFullscreenImage(image)}
            >
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
        <FullscreenViewer 
          image={fullscreenImage} 
          onClose={() => setFullscreenImage(null)} 
        />
      </>
    );
  }

  // Carousel for 5+ images
  return (
    <>
      <div className={cn("relative group", className)}>
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-none w-full cursor-pointer"
                onClick={() => setFullscreenImage(image)}
              >
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full object-cover max-h-[500px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          onClick={(e) => { e.stopPropagation(); scrollNext(); }}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-2.5 py-1 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === selectedIndex 
                  ? "bg-white w-4" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollTo(index);
              }}
            />
          ))}
        </div>
      </div>

      <FullscreenViewer 
        image={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </>
  );
}

// Fullscreen image viewer
function FullscreenViewer({ 
  image, 
  onClose 
}: { 
  image: string | null; 
  onClose: () => void;
}) {
  return (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        {image && (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={image}
            alt="Fullscreen view"
            className="w-full h-full object-contain max-h-[90vh]"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
