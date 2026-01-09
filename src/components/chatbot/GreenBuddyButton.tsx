import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GreenBuddyChatModal } from './GreenBuddyChatModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function GreenBuddyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Only show for logged in users
  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Leaf className="h-6 w-6 text-white" />
              </motion.div>
            </Button>
            
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500/30"
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <GreenBuddyChatModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
