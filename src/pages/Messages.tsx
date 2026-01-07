import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useConversation, useMessages, useSendMessage, useMarkMessagesAsRead, useCreateConversation } from '@/hooks/useMessages';
import { useOnlinePresence } from '@/hooks/useOnlineStatus';
import { useCall } from '@/contexts/CallContext';
import { useTypingIndicator, useSendTypingStatus } from '@/hooks/useTypingIndicator';
import { useMarkSeen, useMessageStatusSubscription } from '@/hooks/useMessageStatus';
import { useIsBlocked } from '@/hooks/useBlocking';
import { useProfile } from '@/hooks/useProfile';
import { useUploadMessageMedia } from '@/hooks/useMediaUpload';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Image, Smile, ArrowLeft, MessageCircle, Gift, Phone, Video, Ban, Mic, Leaf, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OnlineIndicator } from '@/components/messages/OnlineIndicator';
import { TypingIndicator } from '@/components/messages/TypingIndicator';
import { MessageStatus } from '@/components/messages/MessageStatus';
import { ConversationList } from '@/components/messages/ConversationList';
import { EcoStickers } from '@/components/messages/EcoStickers';
import { EmojiPickerFull } from '@/components/messages/EmojiPickerFull';
import { MediaPicker } from '@/components/messages/MediaPicker';
import { CamlyGiftModal } from '@/components/messages/CamlyGiftModal';
import { VoiceRecorder } from '@/components/messages/VoiceRecorder';
import { NewMessageModal } from '@/components/messages/NewMessageModal';
import { CallLogMessage } from '@/components/messages/CallLogMessage';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Messages() {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const { startCall } = useCall();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const [messageInput, setMessageInput] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Enable online presence tracking
  useOnlinePresence();

  // Hooks
  const createConversation = useCreateConversation();
  const uploadMedia = useUploadMessageMedia();
  const { data: userProfile } = useProfile(user?.id || '');
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: activeConversation } = useConversation(conversationId || '');
  const { data: messages, isLoading: messagesLoading } = useMessages(conversationId || '');
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();
  const markAsSeen = useMarkSeen();

  // Real-time features
  const typingUsers = useTypingIndicator(conversationId || null);
  const { startTyping, stopTyping } = useSendTypingStatus(conversationId || null);
  useMessageStatusSubscription(conversationId || null);

  const otherParticipant = activeConversation?.participants?.[0];
  const { data: isBlocked } = useIsBlocked(otherParticipant?.id || '');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-create conversation when userId query param is present
  useEffect(() => {
    if (targetUserId && user && !conversationId && !isCreatingConversation) {
      setIsCreatingConversation(true);
      createConversation.mutateAsync(targetUserId)
        .then((conversation) => {
          navigate(`/messages/${conversation.id}`, { replace: true });
        })
        .catch((error) => {
          console.error('Failed to create conversation:', error);
          toast.error(t('messages.createFailed'));
          navigate('/messages', { replace: true });
        })
        .finally(() => {
          setIsCreatingConversation(false);
        });
    }
  }, [targetUserId, user, conversationId, isCreatingConversation, createConversation, navigate, t]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversationId && user && messages && messages.length > 0) {
      markAsRead.mutate(conversationId);
      markAsSeen.mutate(conversationId);
    }
  }, [conversationId, user, messages?.length]);

  // Reset messages length ref when conversation changes
  useEffect(() => {
    prevMessagesLengthRef.current = 0;
  }, [conversationId]);

  // Scroll to bottom only when new messages are added
  useEffect(() => {
    const currentLength = messages?.length || 0;
    const prevLength = prevMessagesLengthRef.current;

    // Only scroll when: first load OR new message added
    if (currentLength > 0 && (prevLength === 0 || currentLength > prevLength)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages?.length]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    startTyping();
  }, [startTyping]);

  const handleSendMessage = async (content?: string, messageType = 'text', mediaUrl?: string) => {
    const messageContent = content || messageInput.trim();
    if ((!messageContent && !mediaUrl) || !conversationId || isBlocked) return;

    stopTyping();
    
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: messageContent || undefined,
        messageType,
        mediaUrl,
      });
      if (!content && !mediaUrl) setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(t('messages.sendFailed'));
    }
  };

  const handleSendSticker = (sticker: string) => {
    handleSendMessage(sticker);
    setShowStickers(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleSendMedia = async (file: File) => {
    if (!conversationId) return;

    try {
      const mediaUrl = await uploadMedia.mutateAsync(file);
      const isVideo = file.type.startsWith('video/');
      await handleSendMessage(
        isVideo ? t('messages.sentVideo') : t('messages.sentPhoto'),
        isVideo ? 'video' : 'image',
        mediaUrl
      );
      setShowMediaPicker(false);
    } catch (error) {
      console.error('Failed to upload media:', error);
      toast.error(t('messages.uploadFailed'));
    }
  };

  const handleSendGift = async (amount: number) => {
    if (!conversationId) return;
    
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: `🎁 ${t('messages.sentCamly', { amount })}`,
        messageType: 'camly_gift',
        camlyAmount: amount,
      });
      setShowGiftModal(false);
    } catch (error) {
      console.error('Failed to send gift:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading || isCreatingConversation) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-[600px] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
          {/* Conversations List */}
          <Card className={cn(
            'md:col-span-1 overflow-hidden border-primary/10',
            conversationId && 'hidden md:block'
          )}>
            <ConversationList
              conversations={conversations}
              isLoading={conversationsLoading}
              activeConversationId={conversationId}
              onNewMessage={() => setShowNewMessage(true)}
            />
          </Card>

          {/* Chat Window */}
          <Card className={cn(
            'md:col-span-2 flex flex-col overflow-hidden border-primary/10',
            !conversationId && 'hidden md:flex'
          )}>
            {conversationId && activeConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => navigate('/messages')}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                        <AvatarImage src={otherParticipant?.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {otherParticipant?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
                        userId={otherParticipant?.id || ''}
                        className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                        showOffline
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{otherParticipant?.full_name || t('common.user')}</p>
                      <p className="text-xs text-muted-foreground">{t('messages.activeNow')}</p>
                    </div>
                    {/* Action buttons - Gift, Call, Video */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => setShowGiftModal(true)}
                        title={t('messages.giftCamly')}
                      >
                        <Gift className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => startCall(
                          otherParticipant?.id || '',
                          'voice',
                          otherParticipant?.full_name || undefined,
                          otherParticipant?.avatar_url || undefined
                        )}
                        title={t('calls.voiceCall')}
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => startCall(
                          otherParticipant?.id || '',
                          'video',
                          otherParticipant?.full_name || undefined,
                          otherParticipant?.avatar_url || undefined
                        )}
                        title={t('calls.videoCall')}
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className={cn(
                          "h-12 rounded-2xl",
                          i % 2 === 0 ? "w-3/4" : "w-1/2 ml-auto"
                        )} />
                      ))}
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                          const isOwn = message.sender_id === user.id;
                          const showAvatar = !isOwn && (
                            index === 0 || 
                            messages[index - 1]?.sender_id !== message.sender_id
                          );

                          // Render call log message
                          if (message.message_type === 'call_log' && (message as any).payload) {
                            const payload = (message as any).payload;
                            return (
                              <CallLogMessage
                                key={message.id}
                                payload={payload}
                                timestamp={message.created_at}
                                isCurrentUserCaller={payload.caller_id === user.id}
                              />
                            );
                          }

                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className={cn(
                                'flex items-end gap-2 group',
                                isOwn && 'flex-row-reverse'
                              )}
                            >
                              {!isOwn && (
                                <Avatar className={cn(
                                  "h-7 w-7 transition-opacity",
                                  showAvatar ? "opacity-100" : "opacity-0"
                                )}>
                                  <AvatarImage src={message.sender?.avatar_url || ''} />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {message.sender?.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={cn(
                                  'max-w-[70%] rounded-2xl shadow-sm transition-all overflow-hidden',
                                  isOwn
                                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                                    : 'bg-muted/80 rounded-bl-md',
                                  // Remove padding for media messages
                                  (message.message_type === 'image' || message.message_type === 'video') 
                                    ? '' 
                                    : 'px-4 py-2.5'
                                )}
                              >
                                {/* Image message */}
                                {message.message_type === 'image' && message.media_url && (
                                  <div className="relative">
                                    <img 
                                      src={message.media_url} 
                                      alt="Shared image"
                                      className="max-w-full max-h-60 object-cover cursor-pointer rounded-2xl"
                                      onClick={() => window.open(message.media_url!, '_blank')}
                                    />
                                    <div className={cn(
                                      'absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5'
                                    )}>
                                      <span className="text-[10px] text-white">
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
                                      </span>
                                      {isOwn && (
                                        <MessageStatus
                                          status={(message as any).status || 'sent'}
                                          sentAt={message.created_at}
                                          deliveredAt={(message as any).delivered_at}
                                          seenAt={(message as any).seen_at}
                                          isOwn={isOwn}
                                          className="text-white"
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Video message */}
                                {message.message_type === 'video' && message.media_url && (
                                  <div className="relative">
                                    <video 
                                      src={message.media_url}
                                      controls
                                      className="max-w-full max-h-60 rounded-2xl"
                                    />
                                    <div className={cn(
                                      'absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5'
                                    )}>
                                      <span className="text-[10px] text-white">
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Voice message */}
                                {message.message_type === 'voice' && message.media_url && (
                                  <div className="flex items-center gap-2 px-4 py-2.5">
                                    <div className={cn(
                                      'flex items-center gap-2 rounded-full px-3 py-1.5',
                                      isOwn ? 'bg-primary-foreground/20' : 'bg-background/30'
                                    )}>
                                      <Mic className="h-4 w-4" />
                                      <audio 
                                        src={message.media_url} 
                                        controls 
                                        className="h-8 max-w-[180px]" 
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Camly gift message */}
                                {message.message_type === 'camly_gift' && (
                                  <>
                                    <div className="flex items-center gap-2 px-4 py-2.5">
                                      <span className="text-xl">🎁</span>
                                      <span className="font-medium">{t('messages.sentCamly', { amount: message.camly_amount })}</span>
                                    </div>
                                    <div className={cn(
                                      'flex items-center gap-1 px-4 pb-2',
                                      isOwn ? 'justify-end' : ''
                                    )}>
                                      <span className={cn(
                                        'text-[10px]',
                                        isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                      )}>
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
                                      </span>
                                      {isOwn && (
                                        <MessageStatus
                                          status={(message as any).status || 'sent'}
                                          sentAt={message.created_at}
                                          deliveredAt={(message as any).delivered_at}
                                          seenAt={(message as any).seen_at}
                                          isOwn={isOwn}
                                        />
                                      )}
                                    </div>
                                  </>
                                )}

                                {/* Text message */}
                                {(message.message_type === 'text' || !message.message_type || 
                                  (message.message_type !== 'image' && message.message_type !== 'video' && message.message_type !== 'camly_gift')) && (
                                  <>
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <div className={cn(
                                      'flex items-center gap-1 mt-1',
                                      isOwn ? 'justify-end' : ''
                                    )}>
                                      <span className={cn(
                                        'text-[10px]',
                                        isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                      )}>
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
                                      </span>
                                      {isOwn && (
                                        <MessageStatus
                                          status={(message as any).status || 'sent'}
                                          sentAt={message.created_at}
                                          deliveredAt={(message as any).delivered_at}
                                          seenAt={(message as any).seen_at}
                                          isOwn={isOwn}
                                        />
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-10 w-10 text-primary/50" />
                        </div>
                        <p className="font-medium">{t('messages.noMessages')}</p>
                        <p className="text-sm mt-1">{t('messages.sayHello')}</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <TypingIndicator typingUsers={typingUsers} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Input */}
                <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                  {isBlocked ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-3 bg-destructive/10 rounded-xl">
                      <Ban className="h-4 w-4" />
                      <span>{t('messages.blockedUser')}</span>
                    </div>
                  ) : showVoiceRecorder ? (
                    <VoiceRecorder
                      onSendVoice={async (blob, duration) => {
                        try {
                          const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                          const mediaUrl = await uploadMedia.mutateAsync(file);
                          const mins = Math.floor(duration / 60);
                          const secs = duration % 60;
                          await handleSendMessage(
                            `${t('messages.voiceMessage')} (${mins}:${secs.toString().padStart(2, '0')})`,
                            'voice',
                            mediaUrl
                          );
                          setShowVoiceRecorder(false);
                        } catch (error) {
                          console.error('Failed to send voice message:', error);
                          toast.error(t('messages.uploadFailed'));
                          setShowVoiceRecorder(false);
                        }
                      }}
                      onCancel={() => setShowVoiceRecorder(false)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Image/Video picker button */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="shrink-0 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setShowMediaPicker(true)}
                        title={t('messages.sendMedia')}
                      >
                        <Image className="h-5 w-5" />
                      </Button>
                      
                      {/* Stickers */}
                      <Popover open={showStickers} onOpenChange={setShowStickers}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="shrink-0 hover:bg-primary/10 hover:text-primary"
                            title={t('messages.stickers')}
                          >
                            <span className="text-lg">🌿</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-auto" align="start">
                          <EcoStickers onSelectSticker={handleSendSticker} />
                        </PopoverContent>
                      </Popover>

                      {/* Emoji picker */}
                      <Popover open={showEmojis} onOpenChange={setShowEmojis}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="shrink-0 hover:bg-primary/10 hover:text-primary"
                            title={t('messages.emoji')}
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-auto" align="start">
                          <EmojiPickerFull onSelectEmoji={handleSelectEmoji} />
                        </PopoverContent>
                      </Popover>

                      {/* Voice recorder */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="shrink-0 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setShowVoiceRecorder(true)}
                        title={t('messages.voiceMessage')}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>

                      <Input
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={stopTyping}
                        placeholder={t('messages.typeMessage')}
                        className="flex-1 bg-muted/50 border-muted focus-visible:ring-primary/20"
                      />
                      
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!messageInput.trim() || sendMessage.isPending}
                        size="icon"
                        className="shrink-0 bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Media Picker Modal */}
                <MediaPicker
                  open={showMediaPicker}
                  onOpenChange={setShowMediaPicker}
                  onSendMedia={handleSendMedia}
                  isSending={uploadMedia.isPending || sendMessage.isPending}
                />

                {/* Camly Gift Modal */}
                <CamlyGiftModal
                  open={showGiftModal}
                  onOpenChange={setShowGiftModal}
                  recipientName={otherParticipant?.full_name || t('common.user')}
                  userBalance={userProfile?.camly_balance || 0}
                  onSendGift={handleSendGift}
                  isSending={sendMessage.isPending}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <MessageCircle className="h-12 w-12 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-display font-semibold">{t('messages.yourMessages')}</h3>
                  <p className="text-sm mt-2 max-w-xs mx-auto">{t('messages.selectConversation')}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* New Message Modal */}
        <NewMessageModal 
          open={showNewMessage} 
          onOpenChange={setShowNewMessage} 
        />
      </div>
    </Layout>
  );
}
