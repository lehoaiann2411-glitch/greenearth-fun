import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CamlyTransaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  transaction_type: string;
  message_id: string | null;
  description: string | null;
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export type TransactionFilter = 'all' | 'sent' | 'received';

export function useCamlyTransactions(filter: TransactionFilter = 'all') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['camly-transactions', user?.id, filter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('camly_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'sent') {
        query = query.eq('sender_id', user.id);
      } else if (filter === 'received') {
        query = query.eq('receiver_id', user.id);
      } else {
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      const { data: transactions, error } = await query.limit(50);

      if (error) throw error;
      if (!transactions || transactions.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set([
        ...transactions.map(t => t.sender_id),
        ...transactions.map(t => t.receiver_id),
      ])];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Map profiles to transactions
      return transactions.map(t => ({
        ...t,
        sender: profiles?.find(p => p.id === t.sender_id),
        receiver: profiles?.find(p => p.id === t.receiver_id),
      })) as CamlyTransaction[];
    },
    enabled: !!user,
  });
}

export function useTransactionStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['camly-transaction-stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalSent: 0, totalReceived: 0, transactionCount: 0 };

      // Get total sent
      const { data: sentData } = await supabase
        .from('camly_transactions')
        .select('amount')
        .eq('sender_id', user.id);

      // Get total received
      const { data: receivedData } = await supabase
        .from('camly_transactions')
        .select('amount')
        .eq('receiver_id', user.id);

      const totalSent = sentData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalReceived = receivedData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const transactionCount = (sentData?.length || 0) + (receivedData?.length || 0);

      return { totalSent, totalReceived, transactionCount };
    },
    enabled: !!user,
  });
}
