import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Upload, Trash2 } from 'lucide-react';

interface ImageFrameConfig {
  width: number;
  height: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  borderRadius: number;
}

interface DynamicImageFrameProps {
  src?: string;
  alt: string;
  config?: Partial<ImageFrameConfig>;
  onConfigChange?: (config: ImageFrameConfig) => void;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  isAdmin?: boolean;
  uploading?: boolean;
  className?: string;
  placeholder?: string;
}

const defaultConfig: ImageFrameConfig = {
  width: 384,
  height: 384,
  objectFit: 'cover',
  borderRadius: 8
};

export const DynamicImageFrame = ({
  src,
  alt,
  config = {},
  onConfigChange,
  onUpload,
  onRemove,
  isAdmin = false,
  uploading = false,
  className = '',
  placeholder = 'No image available'
}: DynamicImageFrameProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempConfig, setTempConfig] = useState<ImageFrameConfig>({ ...defaultConfig, ...config });

  const currentConfig = { ...defaultConfig, ...config };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    event.target.value = '';
  };

  const handleSaveConfig = () => {
    if (onConfigChange) {
      onConfigChange(tempConfig);
    }
    setShowSettings(false);
  };

  const frameStyle = {
    width: `${currentConfig.width}px`,
    height: `${currentConfig.height}px`,
    borderRadius: `${currentConfig.borderRadius}px`
  };

  const imageStyle = {
    objectFit: currentConfig.objectFit as any,
    borderRadius: `${currentConfig.borderRadius}px`
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <div 
          className="bg-muted border border-gray-300 overflow-hidden flex items-center justify-center"
          style={frameStyle}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full"
              style={imageStyle}
            />
          ) : (
            <div className="text-center text-muted-foreground p-4">
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
              onClick={() => setShowSettings(true)}
              title="Frame Settings"
            >
              <Settings className="h-3 w-3" />
            </Button>
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

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Frame Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Width (px)</label>
                <Input
                  type="number"
                  value={tempConfig.width}
                  onChange={(e) => setTempConfig({ ...tempConfig, width: parseInt(e.target.value) || 0 })}
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Height (px)</label>
                <Input
                  type="number"
                  value={tempConfig.height}
                  onChange={(e) => setTempConfig({ ...tempConfig, height: parseInt(e.target.value) || 0 })}
                  min="50"
                  max="1000"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Image Fit</label>
              <Select
                value={tempConfig.objectFit}
                onValueChange={(value: any) => setTempConfig({ ...tempConfig, objectFit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (crop to fill)</SelectItem>
                  <SelectItem value="contain">Contain (fit inside)</SelectItem>
                  <SelectItem value="fill">Fill (stretch)</SelectItem>
                  <SelectItem value="scale-down">Scale Down</SelectItem>
                  <SelectItem value="none">None (original size)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Border Radius (px)</label>
              <Input
                type="number"
                value={tempConfig.borderRadius}
                onChange={(e) => setTempConfig({ ...tempConfig, borderRadius: parseInt(e.target.value) || 0 })}
                min="0"
                max="50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};