import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useConversation, useMessages, useSendMessage, useMarkMessagesAsRead } from '@/hooks/useMessages';
import { useOnlinePresence } from '@/hooks/useOnlineStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Image, Smile, ArrowLeft, MessageCircle, Gift } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OnlineIndicator } from '@/components/messages/OnlineIndicator';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState('');

  // Enable online presence tracking
  useOnlinePresence();

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: activeConversation } = useConversation(conversationId || '');
  const { data: messages, isLoading: messagesLoading } = useMessages(conversationId || '');
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversationId && user) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const otherParticipant = activeConversation?.participants?.[0];

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className={cn(
            'md:col-span-1',
            conversationId && 'hidden md:block'
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('messages.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversationsLoading ? (
                  <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="divide-y">
                    {conversations.map((conv) => {
                      const participant = conv.participants?.[0];
                      const isActive = conv.id === conversationId;

                      return (
                        <button
                          key={conv.id}
                          onClick={() => navigate(`/messages/${conv.id}`)}
                          className={cn(
                            'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
                            isActive && 'bg-muted'
                          )}
                        >
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={participant?.avatar_url || ''} />
                              <AvatarFallback>
                                {participant?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <OnlineIndicator
                              userId={participant?.id || ''}
                              className="absolute bottom-0 right-0"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {participant?.full_name || 'User'}
                              </p>
                              {conv.last_message_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message_preview || t('messages.startConversation')}
                            </p>
                          </div>
                          {conv.unread_count > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                              {conv.unread_count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('messages.noConversations')}</p>
                    <p className="text-sm">{t('messages.startChatting')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className={cn(
            'md:col-span-2 flex flex-col',
            !conversationId && 'hidden md:flex'
          )}>
            {conversationId && activeConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
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
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant?.avatar_url || ''} />
                        <AvatarFallback>
                          {otherParticipant?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
                        userId={otherParticipant?.id || ''}
                        className="absolute bottom-0 right-0"
                        showOffline
                      />
                    </div>
                    <div>
                      <p className="font-medium">{otherParticipant?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{t('messages.activeNow')}</p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-3/4" />
                      ))}
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user.id;

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              'flex items-end gap-2',
                              isOwn && 'flex-row-reverse'
                            )}
                          >
                            {!isOwn && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender?.avatar_url || ''} />
                                <AvatarFallback>
                                  {message.sender?.full_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2',
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              )}
                            >
                              {message.message_type === 'camly_gift' ? (
                                <div className="flex items-center gap-2">
                                  <Gift className="h-5 w-5" />
                                  <span>{t('messages.sentCamly', { amount: message.camly_amount })}</span>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              )}
                              <p className={cn(
                                'text-xs mt-1',
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}>
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('messages.noMessages')}</p>
                        <p className="text-sm">{t('messages.sayHello')}</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Image className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('messages.typePlaceholder')}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessage.isPending}
                      size="icon"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">{t('messages.yourMessages')}</h3>
                  <p className="text-sm">{t('messages.selectConversation')}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
