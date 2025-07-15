import React, { useRef, useEffect } from 'react';
import { buildUploadUrl } from '@/config/api';
import { lazyLoadImage } from '@/utils/performance';

interface ImageLoaderProps {
  filename?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ 
  filename, 
  alt, 
  className = '', 
  style,
  onError 
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const src = filename ? buildUploadUrl(filename) : '/placeholder.svg';

  useEffect(() => {
    if (imgRef.current && filename) {
      lazyLoadImage(imgRef.current, src);
    }
  }, [src, filename]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/placeholder.svg';
    if (onError) onError(e);
  };

  return (
    <img
      ref={imgRef}
      src={filename ? undefined : '/placeholder.svg'}
      data-src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  );
};

export default ImageLoader;