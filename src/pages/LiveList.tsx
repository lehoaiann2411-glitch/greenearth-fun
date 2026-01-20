import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Radio, Users, Plus, Eye, Gift, Search,
  TrendingUp, Sparkles 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLiveStreams } from '@/hooks/useLiveStream';
import { useAuth } from '@/contexts/AuthContext';

export default function LiveList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: streams = [], isLoading } = useLiveStreams();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStreams = streams.filter((stream) =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="h-6 w-6 text-red-500" />
              Live Stream
            </h1>
            {user && (
              <Button
                onClick={() => navigate('/live/create')}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm live stream..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-4 border-b">
          <div className="flex items-center justify-center gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-red-500">
                <Radio className="h-5 w-5 animate-pulse" />
                <span className="text-2xl font-bold">{streams.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Đang live</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="flex items-center justify-center gap-1 text-emerald-500">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {streams.reduce((sum, s) => sum + s.viewer_count, 0)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Đang xem</p>
            </div>
          </div>
        </div>

        {/* Live Streams Grid */}
        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="text-center py-16">
              <Radio className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">Chưa có live stream nào</h3>
              <p className="text-muted-foreground mb-6">
                Hãy là người đầu tiên phát trực tiếp!
              </p>
              {user && (
                <Button
                  onClick={() => navigate('/live/create')}
                  className="bg-gradient-to-r from-red-500 to-pink-500"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Bắt đầu Live
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredStreams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer group"
                  onClick={() => navigate(`/live/${stream.id}`)}
                >
                  {/* Thumbnail placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20" />
                  
                  {/* Live badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>

                  {/* Viewer count */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    <Eye className="h-3 w-3" />
                    {stream.viewer_count}
                  </div>

                  {/* Stream info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8 border-2 border-red-500">
                        <AvatarImage src={stream.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {stream.profiles?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {stream.profiles?.full_name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-white text-sm font-medium line-clamp-2">
                      {stream.title}
                    </h3>

                    {/* Gifts */}
                    {stream.total_gifts > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs">
                        <Gift className="h-3 w-3" />
                        {stream.total_gifts.toLocaleString()} Camly
                      </div>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Radio className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Go Live Button (mobile) */}
        {user && (
          <div className="fixed bottom-20 right-4 md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/live/create')}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg flex items-center justify-center"
            >
              <Radio className="h-6 w-6" />
            </motion.button>
          </div>
        )}
      </div>
    </Layout>
  );
}
