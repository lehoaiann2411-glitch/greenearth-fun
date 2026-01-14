import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, FileArchive, Upload, X, Loader2, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendFile: (file: File) => Promise<void>;
  isSending: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'text/plain',
  'text/csv',
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (file: File) => {
  if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document')) {
    return FileText;
  }
  if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) {
    return FileArchive;
  }
  return File;
};

export function FilePicker({ open, onOpenChange, onSendFile, isSending }: FilePickerProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t('messages.fileTooLarge', { size: '25MB' }));
      return;
    }

    setSelectedFile(file);
  };

  const handleSend = async () => {
    if (!selectedFile) return;
    await onSendFile(selectedFile);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    onOpenChange(false);
  };

  const IconComponent = selectedFile ? getFileIcon(selectedFile) : File;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('messages.sendFile')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('messages.tapToSelectFile')}</span>
              <span className="text-xs text-muted-foreground/70">
                PDF, DOC, XLS, ZIP... ({t('messages.maxSize', { size: '25MB' })})
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedFile || isSending}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.uploading')}
                </>
              ) : (
                t('messages.send')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
