import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ImagePlus, Type, Sticker, MapPin, 
  Loader2, Camera, RotateCcw, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateStoryEnhanced } from '@/hooks/useStories';
import { useCampaigns } from '@/hooks/useCampaigns';
import { toast } from 'sonner';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CoinRain, useCoinRain } from '@/components/rewards/CoinRain';
import { StoryTextEditor } from './StoryTextEditor';
import { StoryStickerPicker } from './StoryStickerPicker';
import confetti from 'canvas-confetti';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  text?: string;
}
interface CreateStoryFullscreenProps {
  open: boolean;
  onClose: () => void;
}

type ActiveTool = 'none' | 'text' | 'stickers' | 'draw';

export function CreateStoryFullscreen({ open, onClose }: CreateStoryFullscreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [locationName, setLocationName] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const { trigger: coinRainTrigger, triggerRain } = useCoinRain();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const createStory = useCreateStoryEnhanced();
  const { data: campaigns } = useCampaigns();

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be under 50MB');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAddText = useCallback((text: Omit<TextOverlay, 'id' | 'x' | 'y'>) => {
    const newText: TextOverlay = {
      ...text,
      id: `text-${Date.now()}`,
      x: 50,
      y: 50,
    };
    setTextOverlays(prev => [...prev, newText]);
    setActiveTool('none');
  }, []);

  const handleAddSticker = useCallback((sticker: { id: string; emoji: string; text?: string }) => {
    const newSticker: StickerOverlay = {
      ...sticker,
      id: `sticker-${Date.now()}`,
      x: 50,
      y: 50,
      scale: 1,
    };
    setStickers(prev => [...prev, newSticker]);
    setActiveTool('none');
  }, []);

  const handleDrag = useCallback((id: string, deltaX: number, deltaY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, (deltaX / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, (deltaY / rect.height) * 100));

    if (id.startsWith('text-')) {
      setTextOverlays(prev => prev.map(t => 
        t.id === id ? { ...t, x: newX, y: newY } : t
      ));
    } else {
      setStickers(prev => prev.map(s => 
        s.id === id ? { ...s, x: newX, y: newY } : s
      ));
    }
  }, []);

  const handleRemoveOverlay = useCallback((id: string) => {
    if (id.startsWith('text-')) {
      setTextOverlays(prev => prev.filter(t => t.id !== id));
    } else {
      setStickers(prev => prev.filter(s => s.id !== id));
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo or video');
      return;
    }

    try {
      await createStory.mutateAsync({
        file: selectedFile,
        caption: caption.trim() || undefined,
        text_overlays: textOverlays,
        stickers: stickers,
        location_name: locationName.trim() || undefined,
        campaign_id: campaignId || undefined,
      });

      // Success animations
      triggerRain();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#84cc16', '#fbbf24'],
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>🎉 Boom! Story posted!</span>
          <span className="flex items-center gap-1 text-camly-gold font-semibold">
            +2,000 <CamlyCoinIcon size="sm" />
          </span>
        </div>
      );

      setTimeout(() => {
        handleReset();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create story');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setTextOverlays([]);
    setStickers([]);
    setLocationName('');
    setCampaignId(null);
    setActiveTool('none');
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Coin Rain Animation */}
      <CoinRain trigger={coinRainTrigger} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        
        <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-full border border-primary/40">
          <span className="text-white text-sm font-medium">+2,000</span>
          <CamlyCoinIcon size="sm" />
        </div>

        {preview && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleReset}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative overflow-hidden"
      >
        {!preview ? (
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-6 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-dashed border-primary/50 flex items-center justify-center">
              <ImagePlus className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Add Photo or Video</p>
              <p className="text-white/60 text-sm mt-1">Share your green moment 🌱</p>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs text-white/60">Camera</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <span className="text-xs text-white/60">Gallery</span>
              </div>
            </div>
          </motion.button>
        ) : (
          <>
            {/* Media Preview */}
            {selectedFile?.type.startsWith('video/') ? (
              <video
                src={preview}
                className="w-full h-full object-contain"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Text Overlays */}
            {textOverlays.map((overlay) => (
              <motion.div
                key={overlay.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: overlay.fontSize,
                  color: overlay.color,
                  fontFamily: overlay.fontFamily === 'serif' ? 'serif' : overlay.fontFamily === 'mono' ? 'monospace' : 'sans-serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
                drag
                dragMomentum={false}
                onDrag={(_, info) => {
                  const container = containerRef.current;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const x = ((info.point.x - rect.left) / rect.width) * 100;
                    const y = ((info.point.y - rect.top) / rect.height) * 100;
                    setTextOverlays(prev => prev.map(t =>
                      t.id === overlay.id ? { ...t, x, y } : t
                    ));
                  }
                }}
                whileTap={{ scale: 1.1 }}
                onDoubleClick={() => handleRemoveOverlay(overlay.id)}
              >
                {overlay.text}
              </motion.div>
            ))}

            {/* Sticker Overlays */}
            {stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                }}
                drag
                dragMomentum={false}
                onDrag={(_, info) => {
                  const container = containerRef.current;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const x = ((info.point.x - rect.left) / rect.width) * 100;
                    const y = ((info.point.y - rect.top) / rect.height) * 100;
                    setStickers(prev => prev.map(s =>
                      s.id === sticker.id ? { ...s, x, y } : s
                    ));
                  }
                }}
                whileTap={{ scale: 1.2 }}
                onDoubleClick={() => handleRemoveOverlay(sticker.id)}
              >
                {sticker.text ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/80 rounded-full text-white text-sm font-bold">
                    <span className="text-lg">{sticker.emoji}</span>
                    <span>{sticker.text}</span>
                  </div>
                ) : (
                  <span className="text-4xl drop-shadow-lg">{sticker.emoji}</span>
                )}
              </motion.div>
            ))}

            {/* Location Badge */}
            {locationName && (
              <div className="absolute top-20 left-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm">
                <MapPin className="w-4 h-4" />
                <span>{locationName}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tool Panels */}
      <AnimatePresence>
        {activeTool === 'text' && (
          <StoryTextEditor
            onAddText={handleAddText}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'stickers' && (
          <StoryStickerPicker
            onSelectSticker={handleAddSticker}
            onClose={() => setActiveTool('none')}
          />
        )}
      </AnimatePresence>

      {/* Bottom Toolbar */}
      {preview && activeTool === 'none' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
        >
          {/* Tools Row */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setActiveTool('text')}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <span className="text-xs">Text</span>
            </button>
            <button
              onClick={() => setActiveTool('stickers')}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Sticker className="w-5 h-5" />
              </div>
              <span className="text-xs">Stickers</span>
            </button>
            <button
              onClick={() => {
                const location = prompt('Enter location name:');
                if (location) setLocationName(location);
              }}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs">Location</span>
            </button>
          </div>

          {/* Campaign Select */}
          {activeCampaigns.length > 0 && (
            <div className="mb-4">
              <select
                value={campaignId || ''}
                onChange={(e) => setCampaignId(e.target.value || null)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="" className="bg-gray-900">No campaign</option>
                {activeCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id} className="bg-gray-900">
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Caption & Post */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption... 🌱"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white placeholder:text-white/50 text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={createStory.isPending}
              className="bg-primary hover:bg-primary/90 rounded-full px-6"
            >
              {createStory.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-1" />
                  Share
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </motion.div>
  );
}
