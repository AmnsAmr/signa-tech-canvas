import React, { useState, useRef, useEffect } from 'react';
import { buildUploadUrl } from '@/config/api';

interface LazyImageProps {
  filename?: string;
  alt: string;
  className?: string;
  useThumbnail?: boolean;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  filename, 
  alt, 
  className = '', 
  useThumbnail = false,
  onError 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const getImageUrl = () => {
    if (!filename) return '/placeholder.svg';
    return useThumbnail 
      ? `${buildUploadUrl('thumbs/' + filename)}` 
      : buildUploadUrl(filename);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {isInView && filename && !hasError && (
        <img
          src={getImageUrl()}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {(hasError || !filename) && (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">{alt}</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;