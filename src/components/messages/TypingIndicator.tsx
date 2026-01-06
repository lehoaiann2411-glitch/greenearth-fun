import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  typingUsers: { userId: string; fullName: string | null }[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const { t } = useTranslation();

  if (typingUsers.length === 0) return null;

  const names = typingUsers
    .map(u => u.fullName || t('common.user'))
    .slice(0, 2);

  const displayText = names.length === 1
    ? t('messages.typing', { name: names[0] })
    : t('messages.typingMultiple', { 
        name1: names[0], 
        name2: names[1],
        count: typingUsers.length - 2 
      });

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span>{displayText}</span>
    </div>
  );
}
