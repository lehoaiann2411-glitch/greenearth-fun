import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect project ID - you can get one from https://cloud.walletconnect.com
const projectId = 'green-earth-web3';

export const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

export const SUPPORTED_CHAINS = [polygon, polygonAmoy];



export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (chainId: number, txHash: string): string => {
  if (chainId === polygon.id) {
    return `https://polygonscan.com/tx/${txHash}`;
  }
  return `https://amoy.polygonscan.com/tx/${txHash}`;
};
