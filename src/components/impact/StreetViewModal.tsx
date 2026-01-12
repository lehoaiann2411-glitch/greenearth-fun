import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  ExternalLink, 
  MapPin,
  Camera,
  AlertCircle
} from 'lucide-react';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

export function StreetViewModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  locationName
}: StreetViewModalProps) {
  const { t } = useTranslation();
  const [hasStreetView, setHasStreetView] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Google Street View embed URL
  const googleStreetViewUrl = `https://www.google.com/maps/embed?pb=!4v1!6m8!1m7!1s!2m2!1d${latitude}!2d${longitude}!3f0!4f0!5f0.7820865974627469`;
  
  // Google Street View direct link
  const googleStreetViewLink = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`;

  // Mapillary fallback
  const mapillaryUrl = `https://www.mapillary.com/app/?lat=${latitude}&lng=${longitude}&z=17`;

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate checking for Street View availability
      // In production, you'd use Google Street View API to check
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, latitude, longitude]);

  const handleIframeError = () => {
    setHasStreetView(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {t('impact.map.streetView', 'Street View 360°')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[60vh] bg-muted">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-3">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  {t('impact.map.loadingStreetView', 'Đang tải Street View...')}
                </p>
              </div>
            </div>
          )}

          {hasStreetView ? (
            <iframe
              src={googleStreetViewUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Google Street View"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-4 max-w-md p-6">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="font-medium">
                  {t('impact.map.noStreetView', 'Không có Street View tại vị trí này')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('impact.map.noStreetViewDesc', 'Google Street View chưa có ảnh tại khu vực này. Bạn có thể thử xem ảnh cộng đồng trên Mapillary.')}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => window.open(mapillaryUrl, '_blank')}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Mapillary
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')}
                    className="gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t('impact.map.streetViewTip', 'Sử dụng chuột để xoay 360° và phóng to/thu nhỏ')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(googleStreetViewLink, '_blank')}
              className="gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {t('impact.map.openInGoogleMaps', 'Mở trong Google Maps')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              {t('common.done', 'Hoàn tất')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
