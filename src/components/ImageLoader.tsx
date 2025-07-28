import React from 'react';
import { buildUploadUrl } from '@/config/api';
import LazyImage from './shared/LazyImage';

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
  priority = false
}) => {
  const src = filename ? buildUploadUrl(filename) : '/placeholder.svg';

  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onError={onError}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      onError={onError}
    />
  );
};

export default ImageLoader;