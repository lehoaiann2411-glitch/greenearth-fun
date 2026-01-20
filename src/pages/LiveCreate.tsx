import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, X, RefreshCcw, Mic, MicOff, Video, VideoOff,
  Sparkles, Settings, Users, MessageCircle, Gift,
  ChevronLeft, Share2, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useLiveCountdown } from '@/hooks/useLiveCountdown';
import { useLiveSounds } from '@/hooks/useLiveSounds';
import { useLiveRecording } from '@/hooks/useLiveRecording';
import { LiveFilterPicker, LIVE_FILTERS } from '@/components/live/LiveFilterPicker';
import { SaveLiveModal } from '@/components/live/SaveLiveModal';
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
  
  // Beauty Filter state
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  
  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [totalGifts, setTotalGifts] = useState(0);

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
  
  // Custom hooks
  const { countdown, isActive: isCountdownActive, startCountdown } = useLiveCountdown();
  const { 
    playCountdownBeep, 
    playGoLiveChime, 
    playGiftSound, 
    playNewViewerSound,
    playEndStreamSound 
  } = useLiveSounds();
  const {
    isRecording,
    recordedBlob,
    recordingDuration,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  } = useLiveRecording(localStream);

  // Attach stream to video element - also re-attach when step changes
  useEffect(() => {
    if (videoRef.current && localStream) {
      console.log('[LiveCreate] Attaching stream to video element', { step, hasStream: !!localStream });
      videoRef.current.srcObject = localStream;
      
      // Ensure video plays
      videoRef.current.play().catch(err => {
        console.error('[LiveCreate] Video play failed:', err);
      });
    }
  }, [localStream, step]);

  // Play countdown beep sound
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      playCountdownBeep(countdown);
    }
  }, [countdown, playCountdownBeep]);

  // Track gifts from comments
  useEffect(() => {
    const giftComments = comments.filter(c => c.is_gift);
    const total = giftComments.reduce((sum, c) => sum + (c.gift_amount || 0), 0);
    if (total > totalGifts) {
      playGiftSound();
      setTotalGifts(total);
    }
  }, [comments, totalGifts, playGiftSound]);

  // Get current filter CSS
  const currentFilter = LIVE_FILTERS.find((f) => f.id === selectedFilter);
  const filterCSS = currentFilter?.css !== 'none' ? currentFilter?.css : undefined;

  // Light boost (giúp camera sáng và đẹp hơn)
  const baseVideoEnhanceCSS = 'brightness(1.12) contrast(1.05) saturate(1.08)';
  const combinedFilterCSS = [baseVideoEnhanceCSS, filterCSS].filter(Boolean).join(' ');

  // Start camera preview
  const handleStartPreview = async () => {
    try {
      await startBroadcast('video');
      setStep('preview');
    } catch (err) {
      console.error('Failed to start preview:', err);
    }
  };

  // Create stream and go live with countdown
  const handleGoLive = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      // Start countdown
      await startCountdown(3);
      
      // Play go live chime
      playGoLiveChime();

      // Create stream
      const stream = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      
      setStreamId(stream.id);
      await startMutation.mutateAsync(stream.id);
      
      // Start recording
      startRecording();
      
      setStep('live');
    } catch (err) {
      console.error('Failed to go live:', err);
    }
  };

  // End stream
  const handleEndStream = async () => {
    // Play end sound
    playEndStreamSound();
    
    // Stop recording first
    stopRecording();
    
    if (streamId) {
      await endMutation.mutateAsync(streamId);
    }
    stopBroadcast();
    
    // Show save modal
    setShowSaveModal(true);
  };

  // Handle close/back
  const navigateBack = () => {
    const historyLength = window.history.length;
    console.log('[LiveCreate] navigateBack', { historyLength });

    if (historyLength > 1) {
      navigate(-1);
      return;
    }

    // Fallback: nếu user vào thẳng /live/create (không có history)
    navigate('/live');
  };

  const handleClose = () => {
    console.log('[LiveCreate] handleClose', { step });

    if (step === 'live') {
      // Trên mobile, window.confirm đôi khi không hiện ổn định → dùng AlertDialog
      setShowEndConfirm(true);
      return;
    }

    stopBroadcast();
    navigateBack();
  };

  // Handle save modal close
  const handleSaveModalClose = () => {
    setShowSaveModal(false);
    clearRecording();
    navigate('/live');
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Radio className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-4">Đăng nhập để phát live</h2>
          <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 z-50">
      {/* Setup Step */}
      {step === 'setup' && (
        <div className="flex flex-col items-center justify-center h-full px-6 relative">
          {/* Close button - fixed z-index */}
          <button
            onClick={navigateBack}
            className="absolute top-4 left-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Ambient light effects */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            {/* Glassmorphism Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Radio className="h-10 w-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  Bắt đầu Live Stream
                </h1>
                <p className="text-white/70 mb-8">
                  Chia sẻ khoảnh khắc với cộng đồng Green Earth
                </p>

                {/* Stream Title */}
                <div className="mb-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề live stream..."
                    className="bg-white/15 border-white/30 text-white placeholder:text-white/50 text-center focus:bg-white/20 focus:border-pink-400/50 transition-all duration-300"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn (tùy chọn)..."
                    className="bg-white/15 border-white/30 text-white placeholder:text-white/50 resize-none min-h-[80px] focus:bg-white/20 focus:border-pink-400/50 transition-all duration-300"
                    maxLength={200}
                  />
                </div>

                <Button
                  onClick={handleStartPreview}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-6 text-lg shadow-lg shadow-pink-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Tiếp tục
                </Button>

                {/* Reward hint */}
                <div className="flex items-center justify-center gap-2 mt-6 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                  <CamlyCoinIcon size="sm" />
                  <span className="text-sm text-yellow-400">Nhận Camly từ người xem khi live!</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview / Live Step */}
      {(step === 'preview' || step === 'live') && (
        <div className="relative h-full">
          {/* Video Preview with Filter */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ filter: combinedFilterCSS }}
            autoPlay
            muted
            playsInline
          />

          {/* Countdown Overlay */}
          <AnimatePresence>
            {isCountdownActive && countdown !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 z-50"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {countdown > 0 ? (
                    <span className="text-9xl font-bold text-white drop-shadow-lg">
                      {countdown}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-8xl mb-4">🔴</span>
                      <span className="text-3xl font-bold text-white">LIVE!</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-40">
            <button 
              onClick={handleClose} 
              className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors duration-200"
            >
              {step === 'live' ? <X className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
            </button>

            {step === 'live' && (
              <div className="flex items-center gap-3">
                {/* Live badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-bold">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                {/* Duration */}
                <div className="px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-mono">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
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
              {step === 'live' && totalGifts > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                  <CamlyCoinIcon size="sm" />
                  <span className="font-bold">{totalGifts}</span>
                </div>
              )}
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
                  <button 
                    onClick={() => setShowFilterPicker(true)}
                    className={`w-14 h-14 rounded-full backdrop-blur-sm flex items-center justify-center text-white ${
                      selectedFilter !== 'original' ? 'bg-pink-500' : 'bg-white/20'
                    }`}
                  >
                    <Sparkles className="h-6 w-6" />
                  </button>
                </div>

                {/* Go Live Button */}
                <Button
                  onClick={handleGoLive}
                  disabled={createMutation.isPending || startMutation.isPending || isCountdownActive}
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
                <button 
                  onClick={() => setShowFilterPicker(true)}
                  className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center text-white ${
                    selectedFilter !== 'original' ? 'bg-pink-500' : 'bg-white/20'
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Filter Picker */}
          <AnimatePresence>
            {showFilterPicker && (
              <LiveFilterPicker
                selectedFilter={selectedFilter}
                onSelectFilter={(id) => setSelectedFilter(id)}
                onClose={() => setShowFilterPicker(false)}
                videoRef={videoRef}
              />
            )}
          </AnimatePresence>

          {/* Error display */}
          {error && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}

      {/* End live confirm */}
      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kết thúc live stream?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn kết thúc phiên live này không? Bản ghi (nếu có) sẽ được đề xuất lưu lại sau đó.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowEndConfirm(false);
                handleEndStream();
              }}
            >
              Kết thúc
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Live Modal */}
      <SaveLiveModal
        isOpen={showSaveModal}
        onClose={handleSaveModalClose}
        streamId={streamId || ''}
        streamTitle={title}
        recordedBlob={recordedBlob}
        duration={recordingDuration}
        viewerCount={viewerCount}
        giftsReceived={totalGifts}
        onDownload={downloadRecording}
      />
    </div>
  );
}
