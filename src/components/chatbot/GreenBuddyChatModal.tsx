import { useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Leaf, Trash2, X } from 'lucide-react';
import { useGreenBuddyChat } from '@/hooks/useGreenBuddyChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickPrompts } from './QuickPrompts';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface GreenBuddyChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GreenBuddyChatModal({ open, onOpenChange }: GreenBuddyChatModalProps) {
  const { t } = useTranslation();
  const { messages, isLoading, error, sendMessage, clearHistory } = useGreenBuddyChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col"
        hideClose
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-left text-lg">
                  {t('chatbot.title', 'Green Buddy')}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {t('chatbot.subtitle', 'Your eco-friendly assistant')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearHistory}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Welcome message */}
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                    <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('chatbot.greeting', 'Xin chào! Mình là Green Buddy 🌱')}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {t('chatbot.greetingDesc', 'Mình có thể giúp bạn về lối sống xanh, phân loại rác, và bảo vệ môi trường!')}
                  </p>
                </div>

                {/* Quick prompts */}
                <QuickPrompts onSelect={handleQuickPrompt} />
              </motion.div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <motion.span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput 
          onSend={sendMessage} 
          disabled={isLoading}
          placeholder={t('chatbot.placeholder', 'Hỏi về lối sống xanh...')}
        />
      </SheetContent>
    </Sheet>
  );
}
