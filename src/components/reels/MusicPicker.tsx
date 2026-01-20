import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Music, Play, Pause, Check, 
  Volume2, Clock, TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SelectedMusic {
  id: string;
  name: string;
  artist: string;
  audioUrl: string;
  startTime: number;
  endTime: number;
  volume: number;
}

interface Sound {
  id: string;
  name: string;
  artist: string | null;
  category: string | null;
  duration_seconds: number | null;
  audio_url: string;
  cover_image_url: string | null;
  use_count: number | null;
  is_featured: boolean | null;
}

interface MusicPickerProps {
  videoDuration: number;
  currentMusic: SelectedMusic | null;
  onSelect: (music: SelectedMusic | null) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🎵' },
  { id: 'trending', name: 'Thịnh hành', icon: '🔥' },
  { id: 'nature', name: 'Thiên nhiên', icon: '🌿' },
  { id: 'lofi', name: 'Lo-fi', icon: '🎧' },
  { id: 'pop', name: 'Pop', icon: '🎤' },
  { id: 'acoustic', name: 'Acoustic', icon: '🎸' },
];

export function MusicPicker({
  videoDuration,
  currentMusic,
  onSelect,
  onClose,
}: MusicPickerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Music settings
  const [startTime, setStartTime] = useState(currentMusic?.startTime || 0);
  const [volume, setVolume] = useState(currentMusic?.volume || 80);

  // Fetch sounds from database
  const { data: sounds = [], isLoading } = useQuery({
    queryKey: ['sound-library', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('sound_library')
        .select('*')
        .order('use_count', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Sound[];
    },
  });

  // Handle audio playback
  const togglePlay = (sound: Sound) => {
    if (playingId === sound.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = sound.audio_url;
        audioRef.current.currentTime = startTime;
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
        setPlayingId(sound.id);
      }
    }
  };

  const selectSound = (sound: Sound) => {
    setSelectedSound(sound);
    togglePlay(sound);
  };

  // Update audio when settings change
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isPlaying]);

  const handleConfirm = () => {
    if (selectedSound) {
      const endTime = Math.min(startTime + videoDuration, selectedSound.duration_seconds || 30);
      onSelect({
        id: selectedSound.id,
        name: selectedSound.name,
        artist: selectedSound.artist || 'Unknown',
        audioUrl: selectedSound.audio_url,
        startTime,
        endTime,
        volume,
      });
    } else {
      onSelect(null);
    }
    onClose();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="text-white p-2">
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          <Music className="h-5 w-5" />
          Thêm Nhạc
        </h1>
        <Button
          onClick={handleConfirm}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
        >
          <Check className="h-4 w-4 mr-1" />
          {selectedSound ? 'Dùng' : 'Bỏ qua'}
        </Button>
      </div>

      <div className="h-[calc(100vh-60px)] overflow-hidden flex flex-col">
        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhạc..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sound List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sounds.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Không tìm thấy nhạc</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sounds.map((sound) => (
                <motion.button
                  key={sound.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectSound(sound)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedSound?.id === sound.id
                      ? 'bg-emerald-500/20 border border-emerald-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Cover / Play button */}
                  <div className="relative w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    {playingId === sound.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white ml-0.5" />
                    )}
                    {/* Animated ring when playing */}
                    {playingId === sound.id && isPlaying && (
                      <div className="absolute inset-0 rounded-lg border-2 border-emerald-400 animate-ping" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium line-clamp-1">{sound.name}</h3>
                    <p className="text-white/60 text-sm">{sound.artist || 'Unknown'}</p>
                  </div>

                  {/* Duration & Featured */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-white/50 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(sound.duration_seconds)}
                    </span>
                    {sound.is_featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Hot
                      </span>
                    )}
                  </div>

                  {/* Selected check */}
                  {selectedSound?.id === sound.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Music Settings (when sound is selected) */}
        <AnimatePresence>
          {selectedSound && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-gray-900 border-t border-white/10 px-4 py-4"
            >
              {/* Current selection */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Music className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{selectedSound.name}</h4>
                  <p className="text-white/60 text-sm">{selectedSound.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSound(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume control */}
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-white/60" />
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white/60 text-sm w-10 text-right">{volume}%</span>
              </div>

              {/* Start time (simplified) */}
              <p className="text-white/50 text-xs mt-3 text-center">
                Nhạc sẽ bắt đầu từ đầu và tự động cắt theo độ dài video
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
