import React, { useState, useCallback } from 'react';
import LazyImage from './shared/LazyImage';

interface ImageLoaderProps {
  src?: string;
  alt: string;
  className?: string;
  critical?: boolean;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  filename?: string;
  priority?: boolean;

}

const ImageLoader: React.FC<ImageLoaderProps> = ({ 
  src, 
  filename,
  alt, 
  className = '', 
  critical = false, 
  priority = false,
  style = {},
  onError
}) => {
  const [hasError, setHasError] = React.useState(false);
  
  const imageSource = src || (filename ? `/uploads/${filename}` : '/placeholder.svg');
  
  const handleError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    (e.target as HTMLImageElement).src = '/placeholder.svg';
    onError?.(e);
  }, [onError]);

  if (critical || priority) {
    return (
      <img
        src={hasError ? '/placeholder.svg' : imageSource}
        alt={alt}
        className={`${className} gpu-accelerated`}
        style={{
          ...style,
          contentVisibility: 'auto'
        }}
        onError={handleError}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
    );
  }

  return (
    <LazyImage
      src={hasError ? '/placeholder.svg' : imageSource}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

export default React.memo(ImageLoader);