import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, Save, Film, Download, Trash2, 
  Clock, Users, Gift, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaveLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  streamTitle: string;
  recordedBlob: Blob | null;
  duration: number; // in seconds
  viewerCount: number;
  giftsReceived: number;
  onDownload: () => void;
}

export function SaveLiveModal({
  isOpen,
  onClose,
  streamId,
  streamTitle,
  recordedBlob,
  duration,
  viewerCount,
  giftsReceived,
  onDownload,
}: SaveLiveModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [saveType, setSaveType] = useState<'post' | 'reel' | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAsPost = async () => {
    if (!recordedBlob) {
      toast({
        title: 'Không có video',
        description: 'Không tìm thấy video để lưu',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setSaveType('post');

    try {
      // Upload to storage
      const fileName = `live-${streamId}-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(`lives/${fileName}`, recordedBlob, {
          contentType: 'video/webm',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(`lives/${fileName}`);

      // Create post with video
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          content: `🔴 Live: ${streamTitle}`,
          media_urls: [publicUrl],
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (postError) throw postError;

      toast({
        title: 'Đã lưu!',
        description: 'Video đã được đăng lên trang cá nhân',
      });

      onClose();
    } catch (error) {
      console.error('Error saving as post:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu video. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setSaveType(null);
    }
  };

  const handleSaveAsReel = async () => {
    if (!recordedBlob) {
      toast({
        title: 'Không có video',
        description: 'Không tìm thấy video để lưu',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setSaveType('reel');

    try {
      // Upload to storage
      const fileName = `reel-from-live-${streamId}-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(`reels/${fileName}`, recordedBlob, {
          contentType: 'video/webm',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(`reels/${fileName}`);

      // Create reel
      const { error: reelError } = await supabase
        .from('reels')
        .insert({
          video_url: publicUrl,
          caption: `🔴 Từ Live: ${streamTitle}`,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          duration_seconds: duration,
        });

      if (reelError) throw reelError;

      toast({
        title: 'Đã lưu!',
        description: 'Video đã được đăng lên Reels',
      });

      onClose();
    } catch (error) {
      console.error('Error saving as reel:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu video. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setSaveType(null);
    }
  };

  const handleDiscard = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Live đã kết thúc</DialogTitle>
        </DialogHeader>

        {/* Header with icon */}
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center"
          >
            <Radio className="h-10 w-10 text-white" />
          </motion.div>
          
          <h2 className="text-xl font-bold">Live đã kết thúc!</h2>
          <p className="text-muted-foreground text-sm mt-1">{streamTitle}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 py-4 border-y border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {formatDuration(duration)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Thời lượng</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Users className="h-5 w-5 text-muted-foreground" />
              {viewerCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Người xem</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
              <CamlyCoinIcon size="sm" />
              {giftsReceived}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Camly nhận</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleSaveAsPost}
            disabled={isSaving || !recordedBlob}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
          >
            {isSaving && saveType === 'post' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Lưu thành bài viết video
          </Button>

          <Button
            onClick={handleSaveAsReel}
            disabled={isSaving || !recordedBlob}
            variant="outline"
            className="w-full"
          >
            {isSaving && saveType === 'reel' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Film className="h-4 w-4 mr-2" />
            )}
            Đăng lên Reels
          </Button>

          <Button
            onClick={onDownload}
            disabled={!recordedBlob}
            variant="ghost"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải về máy
          </Button>

          <Button
            onClick={handleDiscard}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Không lưu
          </Button>
        </div>

        {!recordedBlob && (
          <p className="text-center text-xs text-muted-foreground">
            Không có video được ghi lại
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
