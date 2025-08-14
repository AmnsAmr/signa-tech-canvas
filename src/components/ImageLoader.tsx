import React, { useState, useCallback } from 'react';
import { apiClient } from '@/api/client';

interface ImageLoaderProps {
  filename?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  filename,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  // If no filename provided or error occurred, show fallback
  if (!filename || hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        onLoad={handleLoad}
      />
    );
  }

  // Use direct URL path for better reliability
  const imageUrl = `/uploads/${filename}`;

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
};

export default ImageLoader;