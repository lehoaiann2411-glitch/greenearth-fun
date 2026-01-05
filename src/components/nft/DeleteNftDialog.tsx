import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteGreenNft } from '@/hooks/useGreenNfts';
import { Loader2, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type GreenNft = Tables<'green_nfts'>;

interface DeleteNftDialogProps {
  nft: GreenNft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteNftDialog({ nft, open, onOpenChange }: DeleteNftDialogProps) {
  const deleteNft = useDeleteGreenNft();

  const handleDelete = async () => {
    await deleteNft.mutateAsync(nft.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Xóa Green NFT
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa NFT <strong>"{nft.tree_type}"</strong>?
            </p>
            <p className="text-sm">
              Hành động này không thể hoàn tác. NFT và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </p>
            {nft.verified && (
              <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                ⚠️ Đây là NFT đã được xác nhận chính thức!
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteNft.isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteNft.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteNft.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa NFT
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
