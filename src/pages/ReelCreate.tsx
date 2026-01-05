import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  X, Upload, Video, MapPin, Users, Hash, Music, 
  Sparkles, Check, ChevronLeft, Play, Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useCreateReel, REEL_REWARDS, TRENDING_HASHTAGS, REEL_STICKERS } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';

export default function ReelCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<'upload' | 'edit'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // Edit fields
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const createMutation = useCreateReel();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Vui lòng chọn file video');
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video không được quá 100MB');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStep('edit');
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(Math.round(videoDuration));

      // Validate duration (15-60 seconds)
      if (videoDuration < 5) {
        alert('Video phải dài ít nhất 5 giây');
        setVideoFile(null);
        setVideoUrl(null);
        setStep('upload');
        return;
      }
      if (videoDuration > 120) {
        alert('Video không được dài quá 2 phút');
        setVideoFile(null);
        setVideoUrl(null);
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

  const handlePublish = () => {
    if (!videoFile || !user) return;

    createMutation.mutate(
      {
        videoFile,
        caption: caption.trim() || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        locationName: locationName.trim() || undefined,
        durationSeconds: duration,
      },
      {
        onSuccess: () => {
          navigate('/reels');
        },
      }
    );
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Đăng nhập để tạo Reel</h2>
            <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black to-transparent">
        <button
          onClick={() => {
            if (step === 'edit') {
              setStep('upload');
              setVideoFile(null);
              setVideoUrl(null);
            } else {
              navigate(-1);
            }
          }}
          className="text-white p-2"
        >
          {step === 'upload' ? <X className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>

        <h1 className="text-white font-bold text-lg">
          {step === 'upload' ? 'Tạo Reel' : 'Chỉnh sửa'}
        </h1>

        {step === 'edit' && (
          <Button
            onClick={handlePublish}
            disabled={createMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
          >
            {createMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Đăng'
            )}
          </Button>
        )}
      </div>

      {step === 'upload' ? (
        /* Upload Step */
        <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] px-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6">
              <Video className="h-16 w-16 text-white" />
            </div>

            <h2 className="text-white text-2xl font-bold mb-2">Tải video lên</h2>
            <p className="text-white/60 mb-8">Video 5 giây - 2 phút, tối đa 100MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-6 rounded-full text-lg font-bold"
            >
              <Upload className="h-5 w-5 mr-2" />
              Chọn video
            </Button>

            {/* Reward hint */}
            <div className="mt-8 flex items-center justify-center gap-2 text-yellow-400">
              <CamlyCoinIcon size="sm" />
              <span className="text-sm">Nhận +{REEL_REWARDS.CREATE.toLocaleString()} Camly khi đăng</span>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Edit Step */
        <div className="flex flex-col md:flex-row h-[calc(100%-60px)]">
          {/* Video Preview */}
          <div className="relative flex-shrink-0 w-full md:w-1/2 h-1/2 md:h-full bg-black">
            <video
              ref={videoRef}
              src={videoUrl || ''}
              className="w-full h-full object-contain"
              loop
              playsInline
              onLoadedMetadata={handleVideoLoad}
              onClick={togglePlayPause}
            />

            {/* Play/Pause overlay */}
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/20"
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-8 w-8 text-white fill-white ml-1" />
                </div>
              )}
            </button>

            {/* Duration badge */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
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
    </div>
  );
}
