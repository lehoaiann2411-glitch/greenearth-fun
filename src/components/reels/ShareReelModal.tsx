import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Copy, Share2, BookOpen, Users, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useShareReel, REEL_REWARDS } from '@/hooks/useReels';
import { toast } from 'sonner';

interface ShareReelModalProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export function ShareReelModal({ reelId, isOpen, onClose, onShareSuccess }: ShareReelModalProps) {
  const [copied, setCopied] = useState(false);
  const [showCoinRain, setShowCoinRain] = useState(false);
  const shareMutation = useShareReel();

  const reelUrl = `${window.location.origin}/reels/${reelId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (type: 'feed' | 'story' | 'friends') => {
    try {
      await shareMutation.mutateAsync({ reelId });
      
      // Show coin rain animation
      setShowCoinRain(true);
      
      // Show reward toast with exciting message
      toast.success(`🎉 Yay! +${REEL_REWARDS.SHARE} Camly Coin for sharing green vibe!`, {
        description: 'Thanks for spreading eco-awareness! 🌱💚',
        duration: 4000,
      });

      setTimeout(() => {
        setShowCoinRain(false);
        onShareSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const shareOptions = [
    { id: 'feed', icon: BookOpen, label: 'Đăng lên Feed', sublabel: 'Chia sẻ với mọi người' },
    { id: 'story', icon: Share2, label: 'Thêm vào Story', sublabel: 'Hiển thị 24 giờ' },
    { id: 'friends', icon: Users, label: 'Gửi cho bạn bè', sublabel: 'Nhắn tin riêng' },
  ];

  // Mock friends for sending
  const friends = [
    { id: '1', name: 'Minh Anh', avatar: '' },
    { id: '2', name: 'Hoàng Long', avatar: '' },
    { id: '3', name: 'Thu Hà', avatar: '' },
    { id: '4', name: 'Văn Đức', avatar: '' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-hidden"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-4">
            <h2 className="text-white text-lg font-bold">Chia sẻ</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Reward Banner */}
          <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <CamlyCoinIcon size="md" />
              <div>
                <p className="text-yellow-400 font-bold text-sm">+{REEL_REWARDS.SHARE} Camly Coin</p>
                <p className="text-yellow-400/70 text-xs">Khi chia sẻ nội dung xanh!</p>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="px-4 mb-4">
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(option.id as 'feed' | 'story' | 'friends')}
                  className="flex flex-col items-center p-4 rounded-2xl bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                    <option.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span className="text-white text-xs font-medium">{option.label}</span>
                  <span className="text-gray-400 text-[10px]">{option.sublabel}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Send to Friends */}
          <div className="px-4 mb-4">
            <p className="text-gray-400 text-sm mb-3">Gửi cho bạn bè</p>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleShare('friends')}
                  className="flex flex-col items-center gap-2 min-w-fit"
                >
                  <Avatar className="h-14 w-14 ring-2 ring-transparent hover:ring-emerald-500 transition-all">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {friend.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-xs max-w-[60px] truncate">{friend.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="px-4 pb-8">
            <p className="text-gray-400 text-sm mb-3">Sao chép liên kết</p>
            <div className="flex gap-2">
              <Input
                value={reelUrl}
                readOnly
                className="flex-1 bg-gray-800 border-gray-700 text-white text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className={`border-gray-700 ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'text-white hover:bg-gray-700'}`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Coin Rain Animation */}
          <AnimatePresence>
            {showCoinRain && (
              <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: -50, 
                      x: Math.random() * window.innerWidth,
                      rotate: 0,
                      opacity: 1 
                    }}
                    animate={{ 
                      y: window.innerHeight + 50,
                      rotate: 360,
                      opacity: 0
                    }}
                    transition={{ 
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                      ease: 'easeIn'
                    }}
                    className="absolute"
                  >
                    <CamlyCoinIcon size="md" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
