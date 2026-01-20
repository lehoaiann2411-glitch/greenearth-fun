import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Radio, X, RefreshCcw, Mic, MicOff, Video, VideoOff,
  Sparkles, Settings, Users, MessageCircle, Gift,
  ChevronLeft, Share2, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { 
  useCreateLiveStream, 
  useStartLiveStream, 
  useEndLiveStream,
  useStreamerBroadcast,
  useLiveComments,
  useStreamPresence
} from '@/hooks/useLiveStream';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';

type Step = 'setup' | 'preview' | 'live';

export default function LiveCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<Step>('setup');
  const [streamId, setStreamId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useCreateLiveStream();
  const startMutation = useStartLiveStream();
  const endMutation = useEndLiveStream();
  
  const {
    localStream,
    isMuted,
    isVideoOff,
    error,
    startBroadcast,
    stopBroadcast,
    toggleMute,
    toggleCamera,
    flipCamera,
  } = useStreamerBroadcast(streamId || undefined);

  const comments = useLiveComments(streamId || undefined);
  const viewerCount = useStreamPresence(streamId || undefined);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Start camera preview
  const handleStartPreview = async () => {
    try {
      await startBroadcast('video');
      setStep('preview');
    } catch (err) {
      console.error('Failed to start preview:', err);
    }
  };

  // Create stream and go live
  const handleGoLive = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      const stream = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      
      setStreamId(stream.id);
      await startMutation.mutateAsync(stream.id);
      setStep('live');
    } catch (err) {
      console.error('Failed to go live:', err);
    }
  };

  // End stream
  const handleEndStream = async () => {
    if (streamId) {
      await endMutation.mutateAsync(streamId);
    }
    stopBroadcast();
    navigate('/live');
  };

  // Handle close/back
  const handleClose = () => {
    if (step === 'live') {
      if (confirm('Bạn có chắc muốn kết thúc live stream?')) {
        handleEndStream();
      }
    } else {
      stopBroadcast();
      navigate(-1);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Radio className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-4">Đăng nhập để phát live</h2>
          <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Setup Step */}
      {step === 'setup' && (
        <div className="flex flex-col items-center justify-center h-full px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md text-center"
          >
            {/* Close button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 text-white p-2"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <Radio className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Bắt đầu Live Stream
            </h1>
            <p className="text-white/60 mb-8">
              Chia sẻ khoảnh khắc với cộng đồng Green Earth
            </p>

            {/* Stream Title */}
            <div className="mb-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề live stream..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn (tùy chọn)..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[80px]"
                maxLength={200}
              />
            </div>

            <Button
              onClick={handleStartPreview}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-6 text-lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Tiếp tục
            </Button>

            {/* Reward hint */}
            <div className="flex items-center justify-center gap-2 text-yellow-400 mt-6">
              <CamlyCoinIcon size="sm" />
              <span className="text-sm">Nhận Camly từ người xem khi live!</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview / Live Step */}
      {(step === 'preview' || step === 'live') && (
        <div className="relative h-full">
          {/* Video Preview */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <button onClick={handleClose} className="text-white p-2">
              {step === 'live' ? <X className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
            </button>

            {step === 'live' && (
              <div className="flex items-center gap-3">
                {/* Live badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-bold">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                {/* Viewer count */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
                  <Users className="h-4 w-4" />
                  {viewerCount}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-black/50 text-white">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full bg-black/50 text-white">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stream Info */}
          <div className="absolute top-20 left-4 right-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-white font-bold">{title || 'Untitled'}</h2>
                <p className="text-white/60 text-sm">{profile?.full_name}</p>
              </div>
            </div>
          </div>

          {/* Comments (Live mode) */}
          {step === 'live' && (
            <div className="absolute bottom-32 left-4 right-20 max-h-[200px] overflow-y-auto">
              {comments.slice(0, 10).map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 p-2 rounded-lg ${
                    comment.is_gift ? 'bg-yellow-500/30' : 'bg-black/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.profiles?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {comment.profiles?.full_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white/80 text-sm font-medium">
                      {comment.profiles?.full_name}
                    </span>
                    {comment.is_gift && (
                      <span className="text-yellow-400 text-xs">
                        🎁 {comment.gift_amount} Camly
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm ml-8">{comment.content}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {step === 'preview' ? (
              /* Preview Controls */
              <div className="space-y-4">
                {/* Camera Controls */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={flipCamera}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
                  >
                    <RefreshCcw className="h-6 w-6" />
                  </button>
                  <button
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full backdrop-blur-sm flex items-center justify-center ${
                      isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full backdrop-blur-sm flex items-center justify-center ${
                      isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>
                  <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <Sparkles className="h-6 w-6" />
                  </button>
                </div>

                {/* Go Live Button */}
                <Button
                  onClick={handleGoLive}
                  disabled={createMutation.isPending || startMutation.isPending}
                  className="w-full py-6 text-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {createMutation.isPending || startMutation.isPending ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Radio className="h-5 w-5 mr-2" />
                      Phát Trực Tiếp
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Live Controls */
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={flipCamera}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
                >
                  <RefreshCcw className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleCamera}
                  className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center ${
                    isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
                
                {/* End Live Button */}
                <button
                  onClick={handleEndStream}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white"
                >
                  <X className="h-8 w-8" />
                </button>

                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
