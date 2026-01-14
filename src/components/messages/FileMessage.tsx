import { FileText, FileImage, FileVideo, FileArchive, Download, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface FileMessageProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  isOwn: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return FileArchive;
  if (fileType.includes('document') || fileType.includes('word')) return FileText;
  return File;
};

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
};

export function FileMessage({ fileName, fileSize, fileType, fileUrl, isOwn }: FileMessageProps) {
  const { t } = useTranslation();
  const IconComponent = getFileIcon(fileType);
  const extension = getFileExtension(fileName);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl min-w-[200px] max-w-[280px]',
      isOwn ? 'bg-primary-foreground/10' : 'bg-background/50'
    )}>
      {/* File Icon */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
        isOwn ? 'bg-primary-foreground/20' : 'bg-primary/10'
      )}>
        <IconComponent className={cn(
          'h-5 w-5',
          isOwn ? 'text-primary-foreground' : 'text-primary'
        )} />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isOwn ? 'text-primary-foreground' : 'text-foreground'
        )}>
          {fileName}
        </p>
        <p className={cn(
          'text-[10px]',
          isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}>
          {extension} • {formatFileSize(fileSize)}
        </p>
      </div>

      {/* Download Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 shrink-0',
          isOwn 
            ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
            : 'hover:bg-primary/10 text-primary'
        )}
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
