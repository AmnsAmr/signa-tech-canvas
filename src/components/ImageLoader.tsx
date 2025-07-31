import React from 'react';
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
  fetchPriority?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ 
  src, 
  filename,
  alt, 
  className = '', 
  critical = false, 
  style = {},
  onError = () => {}
}) => {
  const imageSource = src || (filename ? `/uploads/${filename}` : '/placeholder.svg');
  if (critical) {
    return (
      <img
        src={imageSource}
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
      src={imageSource}
      alt={alt}
      className={className}
      onError={onError ? () => onError(null as any) : undefined}
    />
  );
};

export default ImageLoader;