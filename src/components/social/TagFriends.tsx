import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TaggedUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface TagFriendsProps {
  selectedUsers: TaggedUser[];
  onUsersChange: (users: TaggedUser[]) => void;
}

export function TagFriends({ selectedUsers, onUsersChange }: TagFriendsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<TaggedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!search.trim() || !user) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .neq('id', user.id)
          .ilike('full_name', `%${search}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, user]);

  const toggleUser = (taggedUser: TaggedUser) => {
    const isSelected = selectedUsers.some(u => u.id === taggedUser.id);
    if (isSelected) {
      onUsersChange(selectedUsers.filter(u => u.id !== taggedUser.id));
    } else {
      onUsersChange([...selectedUsers, taggedUser]);
    }
  };

  const removeUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(u => u.id !== userId));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            <span>
              {selectedUsers.length > 0 
                ? `${selectedUsers.length} ${t('post.tagged')}`
                : t('post.tagFriends')
              }
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {t('post.tagFriends')}
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('post.searchFriends')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((taggedUser) => (
                <motion.div
                  key={taggedUser.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge variant="secondary" className="gap-1.5 pr-1">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={taggedUser.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {taggedUser.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{taggedUser.full_name}</span>
                    <button
                      onClick={() => removeUser(taggedUser.id)}
                      className="p-0.5 hover:bg-muted rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Search Results */}
          <ScrollArea className="max-h-[300px]">
            {isSearching ? (
              <div className="py-8 text-center text-muted-foreground">
                {t('common.searching')}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((result) => {
                  const isSelected = selectedUsers.some(u => u.id === result.id);
                  return (
                    <button
                      key={result.id}
                      onClick={() => toggleUser(result)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                        "hover:bg-muted text-left",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={result.avatar_url || undefined} />
                        <AvatarFallback>
                          {result.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 font-medium">{result.full_name}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : search ? (
              <div className="py-8 text-center text-muted-foreground">
                {t('common.noResults')}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {t('post.typeToSearch')}
              </div>
            )}
          </ScrollArea>

          {/* Done Button */}
          <Button onClick={() => setIsOpen(false)} className="w-full">
            {t('common.done')}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Display selected users inline */}
      {selectedUsers.length > 0 && !isOpen && (
        <TaggedUsersList users={selectedUsers} onRemove={removeUser} />
      )}
    </>
  );
}

// Display tagged users list
export function TaggedUsersList({ 
  users, 
  onRemove,
  maxDisplay = 3 
}: { 
  users: TaggedUser[]; 
  onRemove?: (userId: string) => void;
  maxDisplay?: number;
}) {
  const { t } = useTranslation();
  
  if (users.length === 0) return null;

  const displayUsers = users.slice(0, maxDisplay);
  const remaining = users.length - maxDisplay;

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <span>{t('post.with')}</span>
      {displayUsers.map((u, index) => (
        <span key={u.id}>
          <span className="text-foreground font-medium hover:underline cursor-pointer">
            {u.full_name}
          </span>
          {onRemove && (
            <button
              onClick={() => onRemove(u.id)}
              className="ml-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 inline" />
            </button>
          )}
          {index < displayUsers.length - 1 && ', '}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-foreground font-medium">
          {t('post.andMore', { count: remaining })}
        </span>
      )}
    </div>
  );
}
