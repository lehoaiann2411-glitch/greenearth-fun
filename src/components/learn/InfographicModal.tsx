import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, Download, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EducationalContent } from '@/hooks/useEducationalContent';
import { useEffect, useState } from 'react';

interface InfographicModalProps {
  content: EducationalContent | null;
  open: boolean;
  onClose: () => void;
  onView: () => void;
}

export function InfographicModal({ content, open, onClose, onView }: InfographicModalProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open && content && !hasRecordedView) {
      // Record view after 2 seconds
      const timer = setTimeout(() => {
        onView();
        setHasRecordedView(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [open, content, hasRecordedView, onView]);

  useEffect(() => {
    if (!open) {
      setHasRecordedView(false);
      setZoom(1);
    }
  }, [open]);

  if (!content) return null;

  const imageUrl = content.media_url || content.thumbnail_url;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
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

        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-2 p-2 border-b bg-muted/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(z => Math.min(3, z + 0.25))}
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(1)}
          >
            Reset
          </Button>
          {imageUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Image container */}
        <div className="relative overflow-auto max-h-[60vh] bg-muted">
          {imageUrl ? (
            <div className="flex items-center justify-center min-h-[300px] p-4">
              <img
                src={imageUrl}
                alt={content.title}
                className="max-w-full transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <span className="text-6xl mb-4">📊</span>
              <p>Image not available</p>
            </div>
          )}
        </div>

        <div className="p-4 pt-2 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              +{content.points_reward} points for viewing
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
