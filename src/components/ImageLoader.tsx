import React, { useRef, useEffect } from 'react';
import { buildUploadUrl } from '@/config/api';
import { lazyLoadImage } from '@/utils/performance';

interface ImageLoaderProps {
  filename?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  priority?: boolean; // Add priority prop for critical images
  fetchPriority?: 'high' | 'low' | 'auto'; // Add fetchPriority attribute
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ 
  filename, 
  alt, 
  className = '', 
  style,
  onError,
  priority = false,
  fetchPriority = 'auto'
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const src = filename ? buildUploadUrl(filename) : '/placeholder.svg';

  useEffect(() => {
    if (imgRef.current && filename && !priority) {
      // Only use lazy loading for non-priority images
      lazyLoadImage(imgRef.current, src);
    }
  }, [src, filename, priority]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/placeholder.svg';
    if (onError) onError(e);
  };

  return (
    <img
      ref={imgRef}
      src={priority && filename ? src : (filename ? undefined : '/placeholder.svg')}
      data-src={!priority ? src : undefined}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : fetchPriority}
      decoding={priority ? 'sync' : 'async'}
    />
  );
};

export default ImageLoader;