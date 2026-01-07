import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Send, Loader2, Image, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMedia: (file: File) => void;
  isSending: boolean;
}

export function MediaPicker({ open, onOpenChange, onSendMedia, isSending }: MediaPickerProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onSendMedia(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  const isVideo = selectedFile?.type.startsWith('video/');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isVideo ? <Video className="h-5 w-5" /> : <Image className="h-5 w-5" />}
            {t('messages.sendMedia')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('messages.tapToSelect')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-60 rounded-lg object-contain bg-black"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-60 rounded-lg object-contain bg-muted"
                />
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSend}
              disabled={!selectedFile || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.uploading')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('messages.send')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
