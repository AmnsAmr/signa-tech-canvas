import React, { useState, useCallback, useRef, useEffect } from 'react';
import { buildUploadUrl } from '@/config/api';
import { lazyLoadImage } from '@/utils/performance';
import LoadingFallback from './LoadingFallback';

interface ImageLoaderProps {
  filename?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  fallback?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ 
  filename, 
  alt, 
  className = '', 
  style,
  onError,
  fallback
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = filename ? buildUploadUrl(filename) : '/placeholder.svg';

  useEffect(() => {
    if (imgRef.current && filename) {
      lazyLoadImage(imgRef.current, src);
    }
  }, [src, filename]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/placeholder.svg';
    setError(true);
    setLoading(false);
    if (onError) onError(e);
  }, [onError]);

  if (!filename) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`} style={style}>
        <span className="text-muted-foreground">Image non disponible</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`} style={style}>
        <span className="text-muted-foreground">
          {fallback || 'Erreur de chargement'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {loading && (
        <div className="absolute inset-0 z-10">
          <LoadingFallback type="image" className="w-full h-full" />
        </div>
      )}
      <img
        ref={imgRef}
        src={filename ? undefined : '/placeholder.svg'}
        data-src={src}
        alt={alt}
        className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

export default ImageLoader;