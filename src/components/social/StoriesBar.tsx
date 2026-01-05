import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStories, GroupedStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StoryViewer } from './StoryViewer';
import { CreateStoryDialog } from './CreateStoryDialog';
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
                <div className={`w-16 h-16 rounded-full p-[2px] ${
                  myStories ? 'bg-gradient-to-tr from-primary to-emerald-400' : 'bg-muted'
                }`}>
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarImage src={myStories?.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {myStories?.user.full_name?.[0] || '🌱'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {!myStories && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <Plus className="w-4 h-4 text-primary-foreground" />
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
              <div className={`w-16 h-16 rounded-full p-[2px] ${
                group.hasUnviewed 
                  ? 'bg-gradient-to-tr from-primary to-emerald-400 animate-pulse' 
                  : 'bg-muted'
              }`}>
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={group.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {group.user.full_name?.[0] || '🌱'}
                  </AvatarFallback>
                </Avatar>
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
                  <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
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

      {/* Create Story Dialog */}
      <CreateStoryDialog 
        open={showCreateStory} 
        onOpenChange={setShowCreateStory} 
      />
    </>
  );
}
