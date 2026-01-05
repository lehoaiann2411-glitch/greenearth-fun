import { motion } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Viewer {
  id: string;
  viewer_id: string;
  viewed_at: string;
  viewer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface StoryViewersListProps {
  viewers: Viewer[];
  onClose: () => void;
}

export function StoryViewersList({ viewers, onClose }: StoryViewersListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl max-h-[60vh] overflow-hidden z-30"
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Viewers</h3>
            <span className="text-muted-foreground text-sm">({viewers.length})</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(60vh-60px)]">
        {viewers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No viewers yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {viewers.map((viewer) => (
              <div key={viewer.id} className="flex items-center gap-3 p-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={viewer.viewer?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {viewer.viewer?.full_name?.[0] || '🌱'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {viewer.viewer?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(viewer.viewed_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
