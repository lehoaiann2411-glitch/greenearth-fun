import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TreePine, Sparkles, Leaf, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutualFriends } from '@/hooks/useFriendships';

interface SearchResult {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  trees_planted: number;
}

// Sub-component to display mutual friends
function MutualFriendsDisplay({ targetUserId }: { targetUserId: string }) {
  const { t } = useTranslation();
  const { data: mutualFriends, isLoading } = useMutualFriends(targetUserId);

  // Handle both array and object with profiles/total format
  const profiles = Array.isArray(mutualFriends) 
    ? mutualFriends 
    : mutualFriends?.profiles || [];
  const total = Array.isArray(mutualFriends) 
    ? mutualFriends.length 
    : mutualFriends?.total || 0;

  if (isLoading || total === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <Users className="w-3 h-3 text-blue-500" />
      {/* Avatar stack */}
      <div className="flex -space-x-1.5">
        {profiles.slice(0, 3).map((friend) => (
          <Avatar key={friend.id} className="w-4 h-4 border-[1.5px] border-white dark:border-gray-900">
            <AvatarImage src={friend.avatar_url || undefined} />
            <AvatarFallback className="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              {friend.full_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
        {total} {t('friends.mutual', 'bạn chung')}
      </span>
    </div>
  );
}

export function FeedSearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, trees_planted')
          .ilike('full_name', `%${query}%`)
          .limit(5);

        if (!error && data) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSelect = (userId: string) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/profile?id=${userId}`);
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200/60 dark:bg-yellow-500/30 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative mb-4">
      <Card className="relative overflow-hidden 
                       bg-gradient-to-br from-slate-50 via-emerald-50/40 to-white 
                       dark:from-gray-900 dark:via-emerald-950/30 dark:to-gray-900
                       shadow-lg shadow-emerald-200/30 dark:shadow-emerald-900/20
                       border-2 border-emerald-200/60 dark:border-emerald-800/40
                       ring-1 ring-emerald-400/20">
        
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-100/20 via-yellow-50/10 to-emerald-100/20 dark:from-emerald-900/10 dark:via-yellow-900/5 dark:to-emerald-900/10"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(253,224,71,0.05) 50%, rgba(16,185,129,0.08) 100%)',
              'linear-gradient(135deg, rgba(253,224,71,0.05) 0%, rgba(16,185,129,0.08) 50%, rgba(253,224,71,0.05) 100%)',
              'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(253,224,71,0.05) 50%, rgba(16,185,129,0.08) 100%)'
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating orb */}
        <motion.div
          className="absolute top-2 right-8 w-12 h-12 rounded-full pointer-events-none bg-gradient-to-br from-emerald-400/10 to-green-300/5 blur-xl"
          animate={{ 
            x: [0, 5, 0], 
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sparkle decorations */}
        <div className="absolute top-3 right-3 opacity-30 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-3 opacity-25 pointer-events-none">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Leaf className="w-3 h-3 text-emerald-400" />
          </motion.div>
        </div>

        <CardContent className="relative p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={t('feed.searchFriends', 'Tìm bạn bè...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setIsOpen(true)}
              className="pl-9 pr-9 h-10 
                         bg-white/80 dark:bg-gray-800/80 
                         border-emerald-200/60 dark:border-emerald-700/40
                         focus:border-emerald-400 dark:focus:border-emerald-500
                         focus:ring-2 focus:ring-emerald-400/30
                         placeholder:text-emerald-600/50 dark:placeholder:text-emerald-400/50
                         rounded-xl text-sm"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
            )}
            {query && !isLoading && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="overflow-hidden 
                             bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
                             shadow-xl shadow-emerald-200/30 dark:shadow-emerald-900/30
                             border-2 border-emerald-200/60 dark:border-emerald-700/40">
              <ScrollArea className="max-h-[280px]">
                <div className="p-2">
                  {results.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="text-2xl mb-2">🔍</div>
                      {t('feed.noResults', 'Không tìm thấy kết quả')}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {results.map((user) => (
                        <motion.button
                          key={user.id}
                          onClick={() => handleSelect(user.id)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl
                                     hover:bg-gradient-to-r hover:from-emerald-50 hover:to-yellow-50/50
                                     dark:hover:from-emerald-900/30 dark:hover:to-yellow-900/20
                                     transition-all duration-200 text-left"
                          whileHover={{ x: 4 }}
                        >
                          <Avatar className="w-10 h-10 ring-2 ring-emerald-200/50 dark:ring-emerald-700/50">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-green-200 
                                                       dark:from-emerald-800 dark:to-green-900 
                                                       text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                              {user.full_name?.[0] || '🌱'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                              {highlightMatch(user.full_name || 'Green Warrior')}
                            </p>
                            <p className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <TreePine className="w-3 h-3" />
                              <span className="font-medium">{user.trees_planted}</span>
                              {t('feed.treesPlanted')}
                            </p>
                            <MutualFriendsDisplay targetUserId={user.id} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
