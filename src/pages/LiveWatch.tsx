import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, MessageCircle, Gift, Share2, Users,
  Send, Radio, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useLiveStream, 
  useLiveComments, 
  useSendLiveComment,
  useJoinStream,
  useStreamPresence,
  useGiftStreamer
} from '@/hooks/useLiveStream';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

const GIFT_AMOUNTS = [10, 50, 100, 500, 1000];

export default function LiveWatch() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { data: stream, isLoading } = useLiveStream(streamId);
  const comments = useLiveComments(streamId);
  const viewerCount = useStreamPresence(streamId);
  const joinMutation = useJoinStream();
  const commentMutation = useSendLiveComment();
  const giftMutation = useGiftStreamer();

  const [message, setMessage] = useState('');
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [liked, setLiked] = useState(false);

  // Join stream on mount
  useEffect(() => {
    if (streamId && user) {
      joinMutation.mutate(streamId);
    }
  }, [streamId, user]);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendMessage = () => {
    if (!message.trim() || !streamId) return;
    
    commentMutation.mutate({
      streamId,
      content: message.trim(),
    });
    setMessage('');
  };

  const handleGift = (amount: number) => {
    if (!streamId || !stream) return;
    
    giftMutation.mutate({
      streamId,
      streamerId: stream.user_id,
      amount,
    }, {
      onSuccess: () => {
        setShowGiftPanel(false);
      },
      onError: (error) => {
        if (error.message === 'INSUFFICIENT_BALANCE') {
          alert('Số dư Camly không đủ!');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Radio className="h-16 w-16 mx-auto mb-4 text-white/30" />
          <h2 className="text-xl font-bold mb-2">Live stream đã kết thúc</h2>
          <Button onClick={() => navigate('/live')} variant="outline">
            Xem live khác
          </Button>
        </div>
      </div>
    );
  }

  const isEnded = stream.status === 'ended';

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Placeholder (in real implementation, this would be WebRTC video) */}
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {isEnded ? (
          <div className="text-center text-white">
            <Radio className="h-16 w-16 mx-auto mb-4 text-white/30" />
            <p className="text-xl">Live đã kết thúc</p>
          </div>
        ) : (
          <div className="text-center text-white">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center animate-pulse">
              <Radio className="h-12 w-12" />
            </div>
            <p className="text-white/60">Đang kết nối...</p>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-red-500">
            <AvatarImage src={stream.profiles?.avatar_url || ''} />
            <AvatarFallback>{stream.profiles?.full_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-white font-bold">{stream.profiles?.full_name}</h2>
            <p className="text-white/60 text-sm line-clamp-1">{stream.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEnded && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
                <Users className="h-4 w-4" />
                {viewerCount}
              </div>
            </>
          )}
          <button onClick={() => navigate('/live')} className="p-2 text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="absolute bottom-24 left-0 right-20 max-h-[300px] overflow-y-auto px-4 scrollbar-hide">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-2 p-2 rounded-lg ${
              comment.is_gift ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' : 'bg-black/40'
            }`}
          >
            <div className="flex items-start gap-2">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={comment.profiles?.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {comment.profiles?.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-white/80 text-sm font-medium">
                  {comment.profiles?.full_name}
                </span>
                {comment.is_gift && (
                  <span className="ml-2 text-yellow-400 text-xs">
                    🎁 {comment.gift_amount} Camly
                  </span>
                )}
                <p className="text-white text-sm">{comment.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={commentsEndRef} />
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-4">
        <button
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            liked ? 'bg-red-500' : 'bg-white/20'
          }`}>
            <Heart className={`h-6 w-6 ${liked ? 'text-white fill-white' : 'text-white'}`} />
          </div>
        </button>

        <button
          onClick={() => setShowGiftPanel(true)}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">Tặng</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>

      {/* Comment Input */}
      {!isEnded && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Gửi bình luận..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || commentMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Gift Panel */}
      <AnimatePresence>
        {showGiftPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowGiftPanel(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl p-6"
            >
              <h3 className="text-white font-bold text-lg mb-4 text-center">
                Tặng Camly cho {stream.profiles?.full_name}
              </h3>
              
              <div className="grid grid-cols-5 gap-3 mb-6">
                {GIFT_AMOUNTS.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGift(amount)}
                    disabled={giftMutation.isPending}
                    className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500"
                  >
                    <CamlyCoinIcon size="md" />
                    <span className="text-white font-bold mt-1">{amount}</span>
                  </motion.button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowGiftPanel(false)}
                className="w-full"
              >
                Đóng
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
