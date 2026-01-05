import { Wallet, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

export function ConnectWallet() {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balance, 
    formattedAddress, 
    connect, 
    disconnect,
    error 
  } = useWeb3();
  const { toast } = useToast();

  const handleConnect = () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask không được cài đặt',
        description: 'Vui lòng cài đặt MetaMask để kết nối ví',
        variant: 'destructive',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    connect();
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Đã sao chép',
        description: 'Địa chỉ ví đã được sao chép vào clipboard',
      });
    }
  };

  if (isConnecting) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang kết nối...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 border-primary/30 bg-primary/5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <Wallet className="h-4 w-4" />
            {formattedAddress}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Ví của bạn</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex justify-between">
            <span>Số dư</span>
            <span className="font-mono text-sm">{balance ? `${parseFloat(balance).toFixed(4)} MATIC` : '0 MATIC'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyAddress}>
            <span>Sao chép địa chỉ</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-destructive">
            <X className="mr-2 h-4 w-4" />
            Ngắt kết nối
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      variant="outline" 
      className="gap-2 border-primary/30 hover:bg-primary/10"
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">Kết nối ví</span>
    </Button>
  );
}
