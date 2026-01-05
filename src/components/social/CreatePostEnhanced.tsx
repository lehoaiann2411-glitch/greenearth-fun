import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, MapPin, Users, TreePine, X, Loader2, 
  Bold, Italic, List, Camera, Video
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreatePost } from '@/hooks/usePosts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { EmojiPicker } from './EmojiPicker';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { toast } from 'sonner';

type PostType = 'text' | 'photo' | 'video' | 'campaign_update';

export function CreatePostEnhanced() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id || '');
  const createPost = useCreatePost();
  const { data: campaigns } = useCampaigns();

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('text');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 images
    const newFiles = files.slice(0, 10 - selectedImages.length);
    
    setSelectedImages(prev => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (newFiles.length > 0) {
      setPostType('photo');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (selectedImages.length <= 1) {
      setPostType('text');
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding API (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          const locationName = data.display_name?.split(',').slice(0, 3).join(', ') || 'Current Location';
          setLocation(locationName);
        } catch {
          setLocation('Current Location');
        }
      },
      () => {
        toast.error('Unable to get your location');
      }
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      toast.error('Please add some content or images');
      return;
    }

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        imageFile: selectedImages[0], // For now, using first image
        campaignId: selectedCampaign && selectedCampaign !== 'none' ? selectedCampaign : undefined,
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>Post shared!</span>
          <span className="flex items-center gap-1 text-camly-gold font-semibold">
            +3,000 <CamlyCoinIcon size="sm" />
          </span>
        </div>
      );

      // Reset form
      setContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      setLocation('');
      setSelectedCampaign('');
      setPostType('text');
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  if (!user) return null;

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];

  return (
    <Card className="p-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer group">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.full_name?.[0] || '🌱'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 hover:bg-muted rounded-full px-4 py-2.5 transition-colors">
              <span className="text-muted-foreground">
                What's your green story today? 🌱
              </span>
            </div>
          </div>
        </DialogTrigger>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => { setIsOpen(true); fileInputRef.current?.click(); }}
          >
            <ImagePlus className="w-4 h-4 mr-2 text-green-500" />
            Photo
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => { setIsOpen(true); handleGetLocation(); }}
          >
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            Location
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => setIsOpen(true)}
          >
            <TreePine className="w-4 h-4 mr-2 text-emerald-500" />
            Campaign
          </Button>
        </div>

        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Create Post</span>
              <span className="text-sm text-camly-gold flex items-center gap-1 font-normal">
                +3,000 <CamlyCoinIcon size="sm" />
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{profile?.full_name?.[0] || '🌱'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile?.full_name || 'Green Warrior'}</p>
                <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
                  <SelectTrigger className="h-6 text-xs border-none p-0 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">📝 Text Post</SelectItem>
                    <SelectItem value="photo">📷 Photo Post</SelectItem>
                    <SelectItem value="campaign_update">🌳 Campaign Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Share your eco-journey... 🌍🌳🌱"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none text-base border-none focus-visible:ring-0 p-0"
              />
              
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 pt-2 border-t">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bold">
                  <Bold className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Italic">
                  <Italic className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="List">
                  <List className="w-4 h-4 text-muted-foreground" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <EmojiPicker onSelect={insertEmoji} />
              </div>
            </div>

            {/* Image previews */}
            <AnimatePresence>
              {imagePreviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                  {imagePreviews.length < 10 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <ImagePlus className="w-6 h-6 text-muted-foreground" />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location display */}
            <AnimatePresence>
              {location && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-sm flex-1 truncate">{location}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setLocation('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Campaign link */}
            {activeCampaigns.length > 0 && (
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="🌳 Link to a campaign (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No campaign</SelectItem>
                  {activeCampaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600"
              >
                <Camera className="w-4 h-4 mr-1" />
                Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                className="text-red-500"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Location
              </Button>
              
              <div className="flex-1" />
              
              <Button
                onClick={handleSubmit}
                disabled={createPost.isPending || (!content.trim() && selectedImages.length === 0)}
                className="bg-primary hover:bg-primary/90 px-6"
              >
                {createPost.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  '🌱'
                )}
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
