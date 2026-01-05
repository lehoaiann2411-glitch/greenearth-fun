import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, ExternalLink, Copy, Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useClaimCamly } from '@/hooks/usePointsHistory';
import { useConfetti } from '@/hooks/useConfetti';
import { CoinAnimation } from './CoinAnimation';
import {
  toCamlyCoin,
  getClaimableAmount,
  canClaim,
  MINIMUM_CLAIM_POINTS,
  GREEN_POINTS_PER_CAMLY,
} from '@/lib/camlyCoin';

interface ClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  greenPoints: number;
  walletAddress?: string;
}

type ClaimStep = 'input' | 'confirming' | 'success';

export function ClaimModal({ open, onOpenChange, greenPoints, walletAddress }: ClaimModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { triggerCoinRain } = useConfetti();
  const claimMutation = useClaimCamly();

  const [step, setStep] = useState<ClaimStep>('input');
  const [pointsToClaim, setPointsToClaim] = useState<number>(0);
  const [address, setAddress] = useState(walletAddress || '');
  const [result, setResult] = useState<{ txHash: string; camlyAmount: number } | null>(null);

  const { points: maxClaimable, camly: maxCamly } = getClaimableAmount(greenPoints);
  const claimableCamly = toCamlyCoin(pointsToClaim);

  const handleClaim = async () => {
    if (!canClaim(pointsToClaim) || !address) return;

    setStep('confirming');
    try {
      const res = await claimMutation.mutateAsync({
        pointsToConvert: pointsToClaim,
        walletAddress: address,
      });
      setResult({ txHash: res.txHash, camlyAmount: res.camlyAmount });
      setStep('success');
      triggerCoinRain();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim CAMLY. Please try again.',
        variant: 'destructive',
      });
      setStep('input');
    }
  };

  const copyTxHash = () => {
    if (result?.txHash) {
      navigator.clipboard.writeText(result.txHash);
      toast({ title: 'Copied!', description: 'Transaction hash copied to clipboard.' });
    }
  };

  const handleClose = () => {
    setStep('input');
    setPointsToClaim(0);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CoinAnimation size="sm" animated={false} />
            {t('rewards.claimCamly', 'Claim CAMLY Tokens')}
          </DialogTitle>
          <DialogDescription>
            {t('rewards.claimDescription', 'Convert your Green Points to CAMLY tokens')}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  {t('rewards.conversionRate', 'Conversion Rate')}
                </p>
                <p className="font-semibold">
                  {GREEN_POINTS_PER_CAMLY} Green Points = 1 CAMLY
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('rewards.minimumClaim', 'Minimum')}: {MINIMUM_CLAIM_POINTS} GP ({MINIMUM_CLAIM_POINTS / GREEN_POINTS_PER_CAMLY} CAMLY)
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('rewards.pointsToClaim', 'Points to Claim')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={MINIMUM_CLAIM_POINTS}
                    max={maxClaimable}
                    step={GREEN_POINTS_PER_CAMLY}
                    value={pointsToClaim || ''}
                    onChange={(e) => setPointsToClaim(Number(e.target.value))}
                    placeholder={`Min ${MINIMUM_CLAIM_POINTS} GP`}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setPointsToClaim(maxClaimable)}
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: {greenPoints.toLocaleString()} GP (max {maxClaimable.toLocaleString()} claimable)
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('wallet.yourWallet', 'Wallet Address')}</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              {pointsToClaim >= MINIMUM_CLAIM_POINTS && (
                <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">You will receive</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {claimableCamly.toLocaleString()} CAMLY
                  </p>
                </div>
              )}

              <Button
                onClick={handleClaim}
                disabled={!canClaim(pointsToClaim) || !address}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Coins className="mr-2 h-4 w-4" />
                {t('rewards.claimNow', 'Claim CAMLY')}
              </Button>
            </motion.div>
          )}

          {step === 'confirming' && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
              <p className="font-medium">{t('rewards.processing', 'Processing your claim...')}</p>
              <p className="text-sm text-muted-foreground">
                {t('rewards.pleaseWait', 'Please wait while we process your transaction')}
              </p>
            </motion.div>
          )}

          {step === 'success' && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {t('rewards.claimSuccess', 'Claim Successful!')}
                </h3>
                <p className="text-3xl font-bold mt-2">
                  {result.camlyAmount.toLocaleString()} CAMLY
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs flex-1 truncate">{result.txHash}</code>
                  <Button size="icon" variant="ghost" onClick={copyTxHash}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={`https://polygonscan.com/tx/${result.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                {t('common.done', 'Done')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
