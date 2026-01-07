import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatCamly } from '@/lib/camlyCoin';
import { cn } from '@/lib/utils';
import { Gift, Sparkles } from 'lucide-react';

interface CamlyGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  userBalance: number;
  onSendGift: (amount: number) => void;
  isSending?: boolean;
}

const presetAmounts = [100, 500, 1000, 2000, 5000];

export function CamlyGiftModal({
  open,
  onOpenChange,
  recipientName,
  userBalance,
  onSendGift,
  isSending,
}: CamlyGiftModalProps) {
  const { t } = useTranslation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState('');

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const isValidAmount = finalAmount && finalAmount > 0 && finalAmount <= userBalance;

  const handleSend = () => {
    if (finalAmount && isValidAmount) {
      onSendGift(finalAmount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {t('messages.giftCamly.title', { name: recipientName })}
          </DialogTitle>
          <DialogDescription>
            {t('messages.giftCamly.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Balance Display */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <span className="text-sm text-muted-foreground">{t('messages.giftCamly.yourBalance')}</span>
            <div className="flex items-center gap-2">
              <CamlyCoinIcon size="sm" />
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {formatCamly(userBalance)}
              </span>
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="space-y-2">
            <Label>{t('messages.giftCamly.selectAmount')}</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  disabled={amount > userBalance}
                  className={cn(
                    'flex-col h-auto py-2 transition-all duration-200',
                    selectedAmount === amount && !customAmount && 
                      'border-primary bg-primary/10 ring-2 ring-primary/20'
                  )}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  <CamlyCoinIcon size="xs" />
                  <span className="text-xs font-medium mt-1">{amount}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">{t('messages.giftCamly.customAmount')}</Label>
            <div className="relative">
              <CamlyCoinIcon size="xs" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="custom-amount"
                type="number"
                min="1"
                max={userBalance}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder={t('messages.giftCamly.enterAmount')}
                className="pl-10"
              />
            </div>
          </div>

          {/* Preview */}
          {finalAmount && finalAmount > 0 && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <div className="relative">
                <CamlyCoinIcon size="lg" className="animate-bounce" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{finalAmount}</p>
                <p className="text-sm text-muted-foreground">
                  {t('messages.giftCamly.toRecipient', { name: recipientName })}
                </p>
              </div>
            </div>
          )}

          {/* Insufficient Balance Warning */}
          {finalAmount && finalAmount > userBalance && (
            <p className="text-sm text-destructive text-center">
              {t('toast.insufficientBalance')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!isValidAmount || isSending}
            className="flex-1 gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
          >
            <Gift className="h-4 w-4" />
            {isSending ? t('common.loading') : t('messages.giftCamly.send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
