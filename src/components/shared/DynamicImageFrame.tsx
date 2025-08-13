import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';

interface DynamicImageFrameProps {
  src?: string;
  alt: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  isAdmin?: boolean;
  uploading?: boolean;
  className?: string;
  placeholder?: string;
}

export const DynamicImageFrame = ({
  src,
  alt,
  onUpload,
  onRemove,
  isAdmin = false,
  uploading = false,
  className = '',
  placeholder = 'No image available'
}: DynamicImageFrameProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    event.target.value = '';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="bg-muted border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg"
          />
        ) : (
          <div className="text-center text-muted-foreground p-8 min-h-[200px] flex items-center justify-center">
            <p className="text-sm">{placeholder}</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white h-8 w-8 p-0"
            onClick={() => document.getElementById(`upload-${alt}`)?.click()}
            disabled={uploading}
            title={src ? "Replace Image" : "Upload Image"}
          >
            <Upload className="h-3 w-3" />
          </Button>
          {src && onRemove && (
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600/90 hover:bg-red-600 h-8 w-8 p-0"
              onClick={onRemove}
              title="Remove Image"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {isAdmin && (
        <input
          id={`upload-${alt}`}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
    </div>
  );
};