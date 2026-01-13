import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Gift, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useCamlyTransactions, useTransactionStats, TransactionFilter } from '@/hooks/useCamlyTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { formatCamly } from '@/lib/camlyCoin';
import { cn } from '@/lib/utils';

export function TransactionHistory() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const { data: transactions, isLoading } = useCamlyTransactions(filter);
  const { data: stats } = useTransactionStats();
  const language = i18n.language;

  const filters: { value: TransactionFilter; label: string }[] = [
    { value: 'all', label: t('rewards.allTransactions', 'All') },
    { value: 'sent', label: t('rewards.sent', 'Sent') },
    { value: 'received', label: t('rewards.received', 'Received') },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              {t('rewards.transactionHistory', 'Transaction History')}
            </CardTitle>
            <CardDescription>
              {t('rewards.giftTransactions', 'Your Camly gift transactions')}
            </CardDescription>
          </div>
          
          {/* Stats badges */}
          {stats && (
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                -{formatCamly(stats.totalSent)}
              </Badge>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200">
                <ArrowDownLeft className="h-3 w-3 mr-1" />
                +{formatCamly(stats.totalReceived)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className={cn(
                'transition-all',
                filter === f.value && 'shadow-md'
              )}
            >
              {f.value === 'sent' && <ArrowUpRight className="h-3 w-3 mr-1" />}
              {f.value === 'received' && <ArrowDownLeft className="h-3 w-3 mr-1" />}
              {f.value === 'all' && <Filter className="h-3 w-3 mr-1" />}
              {f.label}
            </Button>
          ))}
        </div>

        {/* Transaction list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {transactions.map((tx, index) => {
                const isSender = tx.sender_id === user?.id;
                const otherUser = isSender ? tx.receiver : tx.sender;
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg transition-colors',
                      'hover:bg-muted/80',
                      isSender 
                        ? 'bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20' 
                        : 'bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Direction icon */}
                      <div className={cn(
                        'p-2 rounded-full',
                        isSender 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      )}>
                        {isSender ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      {/* User info */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherUser?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {otherUser?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {isSender 
                              ? (language === 'vi' 
                                  ? `Gửi cho ${otherUser?.full_name || 'Unknown'}` 
                                  : `Sent to ${otherUser?.full_name || 'Unknown'}`)
                              : (language === 'vi'
                                  ? `Nhận từ ${otherUser?.full_name || 'Unknown'}`
                                  : `From ${otherUser?.full_name || 'Unknown'}`)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className={cn(
                      'flex items-center gap-1 font-semibold',
                      isSender ? 'text-red-500' : 'text-green-500'
                    )}>
                      <span>{isSender ? '-' : '+'}{formatCamly(tx.amount)}</span>
                      <CamlyCoinIcon size="xs" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('rewards.noTransactions', 'No transactions yet')}</p>
            <p className="text-sm">
              {t('rewards.sendGiftsToFriends', 'Send Camly gifts to your friends!')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
