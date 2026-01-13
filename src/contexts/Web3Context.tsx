import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WagmiProvider, useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, formatAddress } from '@/lib/web3Config';
import { supabase } from '@/integrations/supabase/client';

interface Web3ContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | undefined;
  formattedAddress: string;
  connect: () => void;
  disconnect: () => void;
  error: Error | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const queryClient = new QueryClient();

// Get user from Supabase directly instead of useAuth to avoid circular dependency
function useSupabaseUser() {
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}

function Web3ContextInner({ children }: { children: ReactNode }) {
  const user = useSupabaseUser();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const [walletSynced, setWalletSynced] = useState(false);

  // Sync wallet address to profile when connected
  useEffect(() => {
    const syncWalletToProfile = async () => {
      if (user && address && isConnected && !walletSynced) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ wallet_address: address })
            .eq('id', user.id);
          
          if (!error) {
            setWalletSynced(true);
          }
        } catch (err) {
          console.error('Failed to sync wallet address:', err);
        }
      }
    };

    syncWalletToProfile();
  }, [user, address, isConnected, walletSynced]);

  // Reset sync state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setWalletSynced(false);
    }
  }, [isConnected]);

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const value: Web3ContextType = {
    address,
    isConnected,
    isConnecting,
    balance: balanceData?.formatted,
    formattedAddress: address ? formatAddress(address) : '',
    connect: handleConnect,
    disconnect,
    error: error || null,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ContextInner>{children}</Web3ContextInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
