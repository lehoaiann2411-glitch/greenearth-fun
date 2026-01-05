import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStory } from '@/hooks/useStories';
import { toast } from 'sonner';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createStory = useCreateStory();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo or video');
      return;
    }

    try {
      const result = await createStory.mutateAsync({
        file: selectedFile,
        caption: caption.trim() || undefined,
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>Story posted!</span>
          <span className="flex items-center gap-1 text-camly-gold font-semibold">
            +1,000 <CamlyCoinIcon size="sm" />
          </span>
        </div>
      );

      // Reset and close
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create story');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Create Story
            <span className="ml-auto text-sm text-camly-gold flex items-center gap-1">
              +1,000 <CamlyCoinIcon size="sm" />
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-[400px] border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ImagePlus className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Add Photo or Video</p>
                <p className="text-sm text-muted-foreground">Up to 50MB</p>
              </div>
            </motion.button>
          ) : (
            <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-black">
              {selectedFile?.type.startsWith('video/') ? (
                <video
                  src={preview}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Textarea
            placeholder="Add a caption... 🌱🌳🌍"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="resize-none"
            rows={2}
          />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={!selectedFile || createStory.isPending}
            >
              {createStory.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                '🌱'
              )}
              Share Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
