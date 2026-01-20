import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Video, MapPin, Hash, 
  Sparkles, ChevronLeft, Play, Camera, Image,
  Music, Scissors, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { ReelCameraCapture } from '@/components/reels/ReelCameraCapture';
import { VideoFilterPicker, VIDEO_FILTERS, VideoFilter } from '@/components/reels/VideoFilterPicker';
import { VideoTrimmer } from '@/components/reels/VideoTrimmer';
import { MusicPicker, SelectedMusic } from '@/components/reels/MusicPicker';
import { useCreateReel, REEL_REWARDS, TRENDING_HASHTAGS, REEL_STICKERS } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';

export default function ReelCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<'upload' | 'camera' | 'edit'>('upload');
  const [cameraMode, setCameraMode] = useState<'video' | 'photo'>('video');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // Edit fields
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  // New features
  const [selectedFilter, setSelectedFilter] = useState<VideoFilter>(VIDEO_FILTERS[0]);
  const [selectedMusic, setSelectedMusic] = useState<SelectedMusic | null>(null);
  const [trimRange, setTrimRange] = useState<{ start: number; end: number } | null>(null);
  
  // Modals
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);

  const createMutation = useCreateReel();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        alert('Vui lòng chọn file video');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('Video không được quá 100MB');
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('Ảnh không được quá 20MB');
        return;
      }
    }

    setMediaFile(file);
    setMediaType(type);
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setStep('edit');
  };

  const handleCameraCapture = (file: File, type: 'video' | 'image') => {
    setMediaFile(file);
    setMediaType(type);
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setStep('edit');
  };

  const handleVideoLoad = () => {
    if (videoRef.current && mediaType === 'video') {
      const videoDuration = videoRef.current.duration;
      setDuration(Math.round(videoDuration));

      if (videoDuration < 5) {
        alert('Video phải dài ít nhất 5 giây');
        setMediaFile(null);
        setMediaUrl(null);
        setStep('upload');
        return;
      }
      if (videoDuration > 120) {
        alert('Video không được dài quá 2 phút');
        setMediaFile(null);
        setMediaUrl(null);
        setStep('upload');
        return;
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const addHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!hashtags.includes(cleanTag) && hashtags.length < 10) {
      setHashtags([...hashtags, cleanTag]);
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const toggleSticker = (stickerId: string) => {
    if (selectedStickers.includes(stickerId)) {
      setSelectedStickers(selectedStickers.filter(s => s !== stickerId));
    } else {
      setSelectedStickers([...selectedStickers, stickerId]);
    }
  };

  const handleTrim = (start: number, end: number) => {
    setTrimRange({ start, end });
    setDuration(Math.round(end - start));
  };

  const handlePublish = () => {
    if (!mediaFile || !user) return;

    createMutation.mutate(
      {
        mediaFile,
        mediaType,
        caption: caption.trim() || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        locationName: locationName.trim() || undefined,
        durationSeconds: mediaType === 'video' ? duration : 10,
      },
      {
        onSuccess: () => {
          navigate('/reels');
        },
      }
    );
  };

  const openCamera = (mode: 'video' | 'photo') => {
    setCameraMode(mode);
    setStep('camera');
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Đăng nhập để tạo Reel</h2>
            <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Background gradient - much brighter */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/50 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
      
      {/* Camera Mode */}
      {step === 'camera' && (
        <ReelCameraCapture
          mode={cameraMode}
          onCapture={handleCameraCapture}
          onClose={() => setStep('upload')}
        />
      )}

      {/* Header */}
      {step !== 'camera' && (
      <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/30 to-transparent">
        <button
          onClick={() => {
            if (step === 'edit') {
              setStep('upload');
              setMediaFile(null);
              setMediaUrl(null);
              setSelectedFilter(VIDEO_FILTERS[0]);
              setSelectedMusic(null);
              setTrimRange(null);
            } else {
              navigate(-1);
            }
          }}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          {step === 'upload' ? <X className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>

        <h1 className="text-white font-bold text-lg">
          {step === 'upload' ? 'Tạo Reel' : 'Chỉnh sửa'}
        </h1>

        {step === 'edit' ? (
          <Button
            onClick={handlePublish}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full px-6 shadow-lg shadow-emerald-500/30"
          >
            {createMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Đăng'
            )}
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>
      )}

      {step === 'upload' && (
        /* Upload Step - Brighter design */
        <div className="relative flex flex-col items-center justify-center h-[calc(100%-60px)] px-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center w-full max-w-md"
          >
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            
            <h2 className="text-white text-2xl font-bold mb-2">Tạo Reel mới</h2>
            <p className="text-white/70 mb-8">Quay video, chụp ảnh hoặc tải lên từ thiết bị</p>

            {/* Three Options */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Record Video */}
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openCamera('video')}
                className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl shadow-red-500/30"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Video className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold">Quay Video</span>
              </motion.button>

              {/* Take Photo */}
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openCamera('photo')}
                className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Camera className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold">Chụp Ảnh</span>
              </motion.button>

              {/* Upload File */}
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/30"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Upload className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold">Tải Video</span>
              </motion.button>
            </div>

            {/* Upload Image Button */}
            <Button
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
              className="w-full border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm mb-4"
            >
              <Image className="h-5 w-5 mr-2" />
              Hoặc tải ảnh từ thiết bị
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileSelect(e, 'video')}
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'image')}
              className="hidden"
            />

            {/* Reward hint */}
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6">
              <CamlyCoinIcon size="sm" animated />
              <span className="text-sm font-medium">Nhận +{REEL_REWARDS.CREATE.toLocaleString()} Camly khi đăng</span>
            </div>

            {/* Tips */}
            <div className="text-left bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <p className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Mẹo tạo Reel hay:
              </p>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Video từ 5 giây đến 2 phút
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Ảnh sẽ hiển thị trong 10 giây
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Thêm hashtag để được nhiều người xem
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}

      {step === 'edit' && (
        /* Edit Step */
        <div className="relative flex flex-col md:flex-row h-[calc(100%-60px)]">
          {/* Media Preview */}
          <div className="relative flex-shrink-0 w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-b from-gray-900 to-black">
            {mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={mediaUrl || ''}
                className="w-full h-full object-contain"
                style={{ filter: selectedFilter.css }}
                loop
                playsInline
                onLoadedMetadata={handleVideoLoad}
                onClick={togglePlayPause}
              />
            ) : (
              <img
                src={mediaUrl || ''}
                alt="Preview"
                className="w-full h-full object-contain"
                style={{ filter: selectedFilter.css }}
              />
            )}
            
            {/* Play/Pause overlay for video */}
            {mediaType === 'video' && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-8 w-8 text-white fill-white ml-1" />
                  </div>
                )}
              </button>
            )}

            {/* Filter badge */}
            {selectedFilter.id !== 'original' && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                {selectedFilter.nameVi}
              </div>
            )}

            {/* Music badge */}
            {selectedMusic && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm flex items-center gap-2 max-w-[150px]">
                <Music className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{selectedMusic.name}</span>
              </div>
            )}

            {/* Duration badge */}
            {mediaType === 'video' && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </div>
            )}

            {/* Image indicator */}
            {mediaType === 'image' && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-emerald-500/80 text-white text-sm flex items-center gap-1">
                <Image className="h-4 w-4" />
                Ảnh
              </div>
            )}

            {/* Quick Edit Tools */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilterPicker(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <Palette className="h-4 w-4" />
                <span className="text-sm">Hiệu ứng</span>
              </motion.button>

              {/* Trim Button (video only) */}
              {mediaType === 'video' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTrimmer(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <Scissors className="h-4 w-4" />
                  <span className="text-sm">Cắt</span>
                </motion.button>
              )}

              {/* Music Button (video only) */}
              {mediaType === 'video' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMusicPicker(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <Music className="h-4 w-4" />
                  <span className="text-sm">Nhạc</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Caption */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Chú thích
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Chia sẻ về hành trình sống xanh của bạn..."
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {caption.length}/500
                </p>
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Hash className="h-4 w-4" /> Hashtag
                </label>
                
                {/* Selected hashtags */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button onClick={() => removeHashtag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    placeholder="Thêm hashtag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && hashtagInput.trim()) {
                        e.preventDefault();
                        addHashtag(hashtagInput.trim());
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => hashtagInput.trim() && addHashtag(hashtagInput.trim())}
                  >
                    Thêm
                  </Button>
                </div>

                {/* Suggested hashtags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {TRENDING_HASHTAGS.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addHashtag(tag)}
                      disabled={hashtags.includes(tag)}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Vị trí
                </label>
                <Input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Thêm vị trí..."
                />
              </div>

              {/* Stickers */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Stickers
                </label>
                <div className="flex flex-wrap gap-2">
                  {REEL_STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => toggleSticker(sticker.id)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                        selectedStickers.includes(sticker.id)
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Info */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CamlyCoinIcon size="sm" animated />
                  <span className="font-bold text-yellow-600">Phần thưởng</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Đăng reel: +{REEL_REWARDS.CREATE.toLocaleString()} Camly</li>
                  <li>• Mỗi 1,000 lượt xem: +{REEL_REWARDS.VIEWS_1000.toLocaleString()} Camly</li>
                  <li>• Top reel tuần: +{REEL_REWARDS.TOP_WEEKLY.toLocaleString()} Camly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Picker Modal */}
      <AnimatePresence>
        {showFilterPicker && mediaUrl && (
          <VideoFilterPicker
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            selectedFilter={selectedFilter}
            onSelect={setSelectedFilter}
            onClose={() => setShowFilterPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Video Trimmer Modal */}
      <AnimatePresence>
        {showTrimmer && mediaUrl && mediaType === 'video' && (
          <VideoTrimmer
            videoUrl={mediaUrl}
            videoDuration={duration}
            onTrim={handleTrim}
            onClose={() => setShowTrimmer(false)}
          />
        )}
      </AnimatePresence>

      {/* Music Picker Modal */}
      <AnimatePresence>
        {showMusicPicker && (
          <MusicPicker
            videoDuration={duration}
            currentMusic={selectedMusic}
            onSelect={setSelectedMusic}
            onClose={() => setShowMusicPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
