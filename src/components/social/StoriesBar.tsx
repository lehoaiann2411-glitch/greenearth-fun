import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStories, GroupedStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StoryViewer } from './StoryViewer';
import { CreateStoryFullscreen } from '@/components/stories/CreateStoryFullscreen';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function StoriesBar() {
  const { user } = useAuth();
  const { data: groupedStories, isLoading } = useStories();
  const [viewingStories, setViewingStories] = useState<GroupedStories | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showCreateStory, setShowCreateStory] = useState(false);

  const handleViewStories = (group: GroupedStories, index: number = 0) => {
    setViewingStories(group);
    setStoryIndex(index);
  };

  const handleNextUser = () => {
    if (!groupedStories || !viewingStories) return;
    const currentIndex = groupedStories.findIndex(g => g.user.id === viewingStories.user.id);
    if (currentIndex < groupedStories.length - 1) {
      setViewingStories(groupedStories[currentIndex + 1]);
      setStoryIndex(0);
    } else {
      setViewingStories(null);
    }
  };

  const handlePrevUser = () => {
    if (!groupedStories || !viewingStories) return;
    const currentIndex = groupedStories.findIndex(g => g.user.id === viewingStories.user.id);
    if (currentIndex > 0) {
      setViewingStories(groupedStories[currentIndex - 1]);
      setStoryIndex(0);
    }
  };

  const myStories = groupedStories?.find(g => g.user.id === user?.id);
  const otherStories = groupedStories?.filter(g => g.user.id !== user?.id) || [];

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4">
          {/* Add Story Button / My Stories */}
          {user && (
            <motion.button
              onClick={() => myStories ? handleViewStories(myStories) : setShowCreateStory(true)}
              className="flex flex-col items-center gap-1 min-w-[72px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* Green glowing ring for stories */}
                <div className={`w-[68px] h-[68px] rounded-full p-[3px] ${
                  myStories 
                    ? 'bg-gradient-to-tr from-primary via-emerald-400 to-lime-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                    : 'bg-muted'
                }`}>
                  <div className="w-full h-full rounded-full p-[2px] bg-background">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={myStories?.user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {myStories?.user.full_name?.[0] || '🌱'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {!myStories && (
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
                {/* Story count badge */}
                {myStories && myStories.stories.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                    {myStories.stories.length}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center truncate w-16">
                {myStories ? 'Your Story' : 'Add Story'}
              </span>
            </motion.button>
          )}

          {/* Other Stories */}
          {otherStories.map((group) => (
            <motion.button
              key={group.user.id}
              onClick={() => handleViewStories(group)}
              className="flex flex-col items-center gap-1 min-w-[72px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* Animated green glowing ring for unviewed stories */}
                <div className={`w-[68px] h-[68px] rounded-full p-[3px] transition-all duration-300 ${
                  group.hasUnviewed 
                    ? 'bg-gradient-to-tr from-primary via-emerald-400 to-lime-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse' 
                    : 'bg-muted'
                }`}>
                  <div className="w-full h-full rounded-full p-[2px] bg-background">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={group.user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {group.user.full_name?.[0] || '🌱'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {/* Story count badge */}
                {group.stories.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                    {group.stories.length}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center truncate w-16">
                {group.user.full_name || 'User'}
              </span>
            </motion.button>
          ))}

          {/* Loading skeletons */}
          {isLoading && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[72px]">
                  <div className="w-[68px] h-[68px] rounded-full bg-muted animate-pulse" />
                  <div className="w-12 h-3 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Story Viewer Modal */}
      {viewingStories && (
        <StoryViewer
          stories={viewingStories.stories}
          user={viewingStories.user}
          initialIndex={storyIndex}
          onClose={() => setViewingStories(null)}
          onNextUser={handleNextUser}
          onPrevUser={handlePrevUser}
        />
      )}

      {/* Create Story Fullscreen */}
      <CreateStoryFullscreen 
        open={showCreateStory} 
        onClose={() => setShowCreateStory(false)} 
      />
    </>
  );
}
