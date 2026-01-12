import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageUploadProps {
  onImageSelect: (imageBase64: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Remove data URL prefix to get just base64
        const base64 = result.split(',')[1];
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [onImageSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={disabled}
        className="gap-2"
      >
        <Upload className="w-5 h-5" />
        {t('scanner.upload', 'Upload Image')}
      </Button>
    </>
  );
}
