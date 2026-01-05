import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useGiftCamly } from '@/hooks/useReels';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { formatCamly } from '@/lib/camlyCoin';

interface ReelGiftModalProps {
  reelId: string;
  receiverId: string;
  receiverName: string;
  isOpen: boolean;
  onClose: () => void;
}

const GIFT_AMOUNTS = [100, 500, 1000, 5000, 10000];

export function ReelGiftModal({ reelId, receiverId, receiverName, isOpen, onClose }: ReelGiftModalProps) {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: profile } = useProfile(user?.id);
  const giftMutation = useGiftCamly();

  const balance = profile?.camly_balance || 0;

  const handleGift = () => {
    if (selectedAmount > balance) return;

    giftMutation.mutate(
      { reelId, receiverId, amount: selectedAmount },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 2000);
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl z-50 max-w-md mx-auto overflow-hidden"
          >
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4"
                >
                  <Sparkles className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Tặng thành công!</h3>
                <p className="text-muted-foreground">
                  Bạn đã tặng {formatCamly(selectedAmount)} Camly Coin cho {receiverName}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-bold">Tặng Camly Coin</h3>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Balance */}
                  <div className="flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl">
                    <span className="text-sm text-muted-foreground">Số dư của bạn</span>
                    <div className="flex items-center gap-2">
                      <CamlyCoinIcon size="sm" />
                      <span className="font-bold text-yellow-600">{formatCamly(balance)}</span>
                    </div>
                  </div>

                  {/* Recipient */}
                  <p className="text-sm text-muted-foreground mb-4">
                    Tặng cho <span className="font-semibold text-foreground">@{receiverName}</span>
                  </p>

                  {/* Amount Selection */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {GIFT_AMOUNTS.map((amount) => (
                      <motion.button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedAmount === amount
                            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                        } ${amount > balance ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={amount > balance}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CamlyCoinIcon size="xs" />
                          <span className="font-bold text-sm">{formatCamly(amount)}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleGift}
                    disabled={selectedAmount > balance || giftMutation.isPending}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-6 rounded-xl"
                  >
                    {giftMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CamlyCoinIcon size="sm" className="mr-2" />
                        Tặng {formatCamly(selectedAmount)} Camly
                      </>
                    )}
                  </Button>

                  {selectedAmount > balance && (
                    <p className="text-center text-sm text-red-500 mt-3">
                      Số dư không đủ
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
