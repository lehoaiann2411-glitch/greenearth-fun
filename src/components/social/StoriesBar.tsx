import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStories, GroupedStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StoryViewer } from './StoryViewer';
import { CreateStoryFullscreen } from '@/components/stories/CreateStoryFullscreen';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export function StoriesBar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
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

  // Sparkle positions for the sparkle grid
  const sparklePositions = [
    { top: '15%', left: '8%', delay: 0 },
    { top: '25%', right: '12%', delay: 0.3 },
    { top: '60%', left: '15%', delay: 0.6 },
    { top: '45%', right: '8%', delay: 0.9 },
    { top: '80%', left: '25%', delay: 1.2 },
    { top: '70%', right: '20%', delay: 1.5 },
  ];

  return (
    <>
      <Card className="relative overflow-hidden border-0 ring-2 ring-emerald-400/20 hover:ring-emerald-400/40 transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-gradient-to-r from-slate-50 via-emerald-50/50 to-white dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900">
        {/* Floating Orbs */}
        <motion.div
          className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/15 to-green-300/10 blur-2xl pointer-events-none"
          animate={{
            x: [0, 15, 0],
            y: [0, 10, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-4 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/10 to-amber-300/5 blur-2xl pointer-events-none"
          animate={{
            x: [0, -12, 0],
            y: [0, 8, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-300/10 to-lime-300/5 blur-xl pointer-events-none"
          animate={{
            x: [0, 10, 0],
            y: [0, -8, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Sparkle Grid */}
        {sparklePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-br from-white to-yellow-200 rounded-full pointer-events-none"
            style={{ top: pos.top, left: pos.left, right: pos.right }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pos.delay,
            }}
          />
        ))}

        {/* Aurora Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/8 to-transparent pointer-events-none"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-2 px-4 pt-3 pb-1">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </motion.div>
          <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Stories
          </span>
        </div>

        {/* Stories Content */}
        <ScrollArea className="w-full relative z-10">
          <div className="flex gap-4 px-4 pb-4 pt-2">
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
                        <AvatarImage src={myStories?.user.avatar_url || profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {myStories?.user.full_name?.[0] || profile?.full_name?.[0] || ''}
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
                  {myStories ? t('story.yourStory') : t('story.addStory')}
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
                  {/* Green glowing ring for unviewed stories */}
                  <div className={`w-[68px] h-[68px] rounded-full p-[3px] transition-all duration-300 ${
                    group.hasUnviewed 
                      ? 'bg-gradient-to-tr from-primary via-emerald-400 to-lime-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
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
                  {group.user.full_name || t('story.user')}
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
      </Card>

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
