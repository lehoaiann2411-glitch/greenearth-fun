import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EducationalContent } from '@/hooks/useEducationalContent';
import { useEffect, useState } from 'react';

interface VideoPlayerModalProps {
  content: EducationalContent | null;
  open: boolean;
  onClose: () => void;
  onView: () => void;
}

export function VideoPlayerModal({ content, open, onClose, onView }: VideoPlayerModalProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const [hasRecordedView, setHasRecordedView] = useState(false);

  useEffect(() => {
    if (open && content && !hasRecordedView) {
      // Record view after 3 seconds of watching
      const timer = setTimeout(() => {
        onView();
        setHasRecordedView(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, content, hasRecordedView, onView]);

  useEffect(() => {
    if (!open) {
      setHasRecordedView(false);
    }
  }, [open]);

  if (!content) return null;

  // Extract video ID from YouTube/Vimeo URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return url;
  };

  const embedUrl = getEmbedUrl(content.media_url);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-lg">
                {isVi && content.title_vi ? content.title_vi : content.title}
              </DialogTitle>
              {content.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {isVi && content.description_vi ? content.description_vi : content.description}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-2 top-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <span className="text-6xl">🎬</span>
              <p>Video not available</p>
              {content.media_url && (
                <Button variant="secondary" asChild>
                  <a href={content.media_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in new tab
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="p-4 pt-2 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              +{content.points_reward} points for watching
            </Badge>
          </div>

          {hasRecordedView && (
            <Badge className="bg-green-500">
              ✓ Points earned!
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
